import json
from pathlib import Path
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from app.providers.base import BasePriceProvider
from app.models.price_slot import PriceSlotModel

IST = timezone(timedelta(hours=5, minutes=30))


class DemoPriceProvider(BasePriceProvider):
    def __init__(self, json_path: Optional[str] = None):
        if json_path:
            self.json_path = Path(json_path)
        else:
            # Look up from project root / data / demo_prices.json
            root = Path(__file__).resolve().parent.parent.parent.parent
            self.json_path = root / "data" / "demo_prices.json"

    def get_source_name(self) -> str:
        return "DEMO"

    async def fetch_slots(self, horizon_date: Optional[str] = None) -> List[PriceSlotModel]:
        today_date = horizon_date or datetime.now(IST).strftime("%Y-%m-%d")
        base_date = datetime.strptime(today_date, "%Y-%m-%d").replace(tzinfo=IST)

        if not self.json_path.exists():
            return self._generate_fallback_slots(today_date)

        try:
            with open(self.json_path, "r", encoding="utf-8") as f:
                data = json.load(f)
                slots_data = data.get("slots", [])
                result = []
                for s in slots_data:
                    idx = s["index"]
                    st = base_date + timedelta(minutes=15 * idx)
                    et = st + timedelta(minutes=15)
                    result.append(
                        PriceSlotModel(
                            index=idx,
                            start_time=st.isoformat(),
                            end_time=et.isoformat(),
                            price_rs_mwh=float(s["price_rs_mwh"]),
                            price_rs_kwh=float(s["price_rs_kwh"]),
                            source="DEMO",
                        )
                    )
                return result
        except Exception:
            return self._generate_fallback_slots(today_date)


    def _generate_fallback_slots(self, horizon_date: Optional[str] = None) -> List[PriceSlotModel]:
        base_date = datetime.now(IST).replace(hour=0, minute=0, second=0, microsecond=0)
        slots = []
        for i in range(96):
            start = base_date + timedelta(minutes=15 * i)
            end = start + timedelta(minutes=15)
            # Characteristic curve: off-peak morning ~ 3.2, peak ~ 7.5
            hour = start.hour + start.minute / 60.0
            if 0 <= hour < 6:
                p_mwh = 3000 + (hour - 3) ** 2 * 30
            elif 6 <= hour < 10:
                p_mwh = 5500 + (hour - 6) * 400
            elif 10 <= hour < 16:
                p_mwh = 4200 - (13 - abs(hour - 13)) * 100
            elif 16 <= hour < 22:
                p_mwh = 6800 + (hour - 19) ** 2 * -60
            else:
                p_mwh = 4500 - (hour - 22) * 400
            p_kwh = round(p_mwh / 1000.0, 4)
            slots.append(
                PriceSlotModel(
                    index=i,
                    start_time=start.isoformat(),
                    end_time=end.isoformat(),
                    price_rs_mwh=round(p_mwh, 2),
                    price_rs_kwh=p_kwh,
                    source="DEMO",
                )
            )
        return slots
