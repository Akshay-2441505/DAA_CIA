import os
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Tuple
from app.models.price_slot import PriceSlotModel, PriceHorizonResponse, CurrentPriceResponse
from app.providers.base import BasePriceProvider
from app.providers.demo_provider import DemoPriceProvider
from app.providers.india_energy_atlas import IndiaEnergyAtlasProvider
from app.database.repositories import PriceSlotRepository

logger = logging.getLogger("powersched.price_service")
IST = timezone(timedelta(hours=5, minutes=30))


class PriceService:
    def __init__(
        self,
        live_provider: Optional[BasePriceProvider] = None,
        demo_provider: Optional[BasePriceProvider] = None,
    ):
        self.live_provider = live_provider or IndiaEnergyAtlasProvider()
        self.demo_provider = demo_provider or DemoPriceProvider()

    async def get_slots(self, force_refresh: bool = False) -> Tuple[List[PriceSlotModel], str]:
        """
        Retrieves 96 slots using 3-tier fallback strategy:
        1. Live provider (if configured)
        2. SQLite Cached slots
        3. Demo provider
        Returns: (slots, source_badge: 'LIVE' | 'CACHED' | 'DEMO')
        """
        today_date = datetime.now(IST).strftime("%Y-%m-%d")

        # 1. Attempt Live
        if os.getenv("PRICE_PROVIDER", "demo").lower() == "atlas" or force_refresh:
            try:
                slots = await self.live_provider.fetch_slots()
                if slots and len(slots) >= 96:
                    PriceSlotRepository.save_slots(today_date, "LIVE", slots)
                    return slots, "LIVE"
            except Exception as e:
                logger.warning(f"Live price provider failed: {e}. Falling back to cache/demo.")

        # 2. Check SQLite Cache
        cached_slots = PriceSlotRepository.get_slots_by_date(today_date)
        if not cached_slots:
            cached_slots = PriceSlotRepository.get_latest_slots()

        if cached_slots and len(cached_slots) >= 96:
            # Preserve LIVE source if slots came from live feed
            first_source = cached_slots[0].source
            source = "LIVE" if first_source == "LIVE" else ("DEMO" if first_source == "DEMO" else "CACHED")
            return cached_slots, source


        # 3. Fallback to Demo Provider
        demo_slots = await self.demo_provider.fetch_slots()
        PriceSlotRepository.save_slots(today_date, "DEMO", demo_slots)
        return demo_slots, "DEMO"

    async def get_today_horizon(self, force_refresh: bool = False) -> PriceHorizonResponse:
        slots, source = await self.get_slots(force_refresh=force_refresh)
        today_date = datetime.now(IST).strftime("%Y-%m-%d")
        now_iso = datetime.now(IST).isoformat()

        prices = [s.price_rs_kwh for s in slots]
        min_p = min(prices) if prices else 0.0
        max_p = max(prices) if prices else 0.0
        avg_p = sum(prices) / len(prices) if prices else 0.0

        cheapest = min(slots, key=lambda s: s.price_rs_kwh) if slots else None
        expensive = max(slots, key=lambda s: s.price_rs_kwh) if slots else None

        return PriceHorizonResponse(
            horizon_date=today_date,
            source=source,
            fetched_at=now_iso,
            slot_count=len(slots),
            min_price_kwh=round(min_p, 4),
            max_price_kwh=round(max_p, 4),
            avg_price_kwh=round(avg_p, 4),
            cheapest_slot=cheapest,
            most_expensive_slot=expensive,
            slots=slots,
        )

    async def get_current_price_status(self) -> CurrentPriceResponse:
        slots, source = await self.get_slots()
        now = datetime.now(IST)
        now_iso = now.isoformat()

        # Find current 15-minute slot
        current_slot = None
        for s in slots:
            st = datetime.fromisoformat(s.start_time)
            et = datetime.fromisoformat(s.end_time)
            if st <= now < et:
                current_slot = s
                break

        if not current_slot and slots:
            current_slot = slots[0]

        # Find cheapest 2-hour window (8 consecutive slots) upcoming from current slot
        current_idx = current_slot.index if current_slot else 0
        cheapest_window = None
        min_cost = float("inf")

        for i in range(current_idx, min(current_idx + 32, len(slots) - 8 + 1)):
            window = slots[i : i + 8]
            w_cost = sum(s.price_rs_kwh for s in window)
            if w_cost < min_cost:
                min_cost = w_cost
                cheapest_window = {
                    "start_time": window[0].start_time,
                    "end_time": window[-1].end_time,
                    "avg_price_kwh": round(w_cost / 8.0, 4),
                    "duration_minutes": 120,
                }

        return CurrentPriceResponse(
            current_time=now_iso,
            current_slot=current_slot,
            cheapest_upcoming_window=cheapest_window,
            source=source,
            last_updated=now_iso,
        )
