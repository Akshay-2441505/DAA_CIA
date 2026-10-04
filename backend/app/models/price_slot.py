from typing import List, Optional
from pydantic import BaseModel, Field


class PriceSlotModel(BaseModel):
    index: int
    start_time: str
    end_time: str
    price_rs_mwh: float
    price_rs_kwh: float
    source: str = Field(default="DEMO", description="'LIVE', 'CACHED', or 'DEMO'")


class PriceHorizonResponse(BaseModel):
    horizon_date: str
    source: str
    fetched_at: str
    slot_count: int
    min_price_kwh: float
    max_price_kwh: float
    avg_price_kwh: float
    cheapest_slot: Optional[PriceSlotModel] = None
    most_expensive_slot: Optional[PriceSlotModel] = None
    slots: List[PriceSlotModel]


class CurrentPriceResponse(BaseModel):
    current_time: str
    current_slot: Optional[PriceSlotModel] = None
    cheapest_upcoming_window: Optional[dict] = None
    source: str
    last_updated: str
