import os
import httpx
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.providers.base import BasePriceProvider
from app.models.price_slot import PriceSlotModel

IST = timezone(timedelta(hours=5, minutes=30))


class IndiaEnergyAtlasProvider(BasePriceProvider):
    # Primary API domain for India Energy Atlas developer endpoints
    BASE_URL = "https://api.energymap.in/developer/v1/market/iex/latest"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("ATLAS_API_KEY", "")

    def get_source_name(self) -> str:
        return "LIVE"

    async def fetch_slots(self, horizon_date: Optional[str] = None) -> List[PriceSlotModel]:
        api_key = self.api_key or os.getenv("ATLAS_API_KEY", "")
        if not api_key:
            raise ValueError("No ATLAS_API_KEY configured for live India Energy Atlas provider.")

        headers = {
            "X-API-Key": api_key,
            "Accept": "application/json",
        }

        params = {
            "market_type": "DAM",
            "limit": 96,
        }

        async with httpx.AsyncClient(timeout=12.0) as client:
            response = await client.get(self.BASE_URL, headers=headers, params=params)
            response.raise_for_status()
            data = response.json()

        # Parse and normalize into 96 slots
        raw_items = data.get("data", []) or data.get("results", []) or data
        if not isinstance(raw_items, list) or len(raw_items) == 0:
            raise ValueError("India Energy Atlas returned empty or unrecognized payload.")

        # Sort chronologically by timestamp if available
        parsed_items = []
        today_midnight = datetime.now(IST).replace(hour=0, minute=0, second=0, microsecond=0)

        for idx, item in enumerate(raw_items[:96]):
            # MCP in Rs/MWh -> Rs/kWh
            mcp_val = item.get("mcp_rs_mwh") or item.get("mcp") or item.get("price_rs_mwh") or 4000.0
            try:
                mcp = float(mcp_val)
            except (ValueError, TypeError):
                mcp = 4000.0
            kwh_price = round(mcp / 1000.0, 4)

            # Start and end time normalization
            ts_str = item.get("timestamp") or item.get("start_time")
            if ts_str:
                try:
                    dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00")).astimezone(IST)
                    st = dt
                    et = dt + timedelta(minutes=15)
                except Exception:
                    st = today_midnight + timedelta(minutes=15 * idx)
                    et = st + timedelta(minutes=15)
            else:
                st = today_midnight + timedelta(minutes=15 * idx)
                et = st + timedelta(minutes=15)

            parsed_items.append((st, et, mcp, kwh_price))

        # Sort chronologically
        parsed_items.sort(key=lambda x: x[0])

        slots: List[PriceSlotModel] = []
        for i, (st, et, mcp, kwh_price) in enumerate(parsed_items):
            slots.append(
                PriceSlotModel(
                    index=i,
                    start_time=st.isoformat(),
                    end_time=et.isoformat(),
                    price_rs_mwh=round(mcp, 2),
                    price_rs_kwh=kwh_price,
                    source="LIVE",
                )
            )

        return slots
