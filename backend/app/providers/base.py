from abc import ABC, abstractmethod
from typing import List, Optional
from app.models.price_slot import PriceSlotModel


class BasePriceProvider(ABC):
    @abstractmethod
    def get_source_name(self) -> str:
        """Returns provider name, e.g. 'LIVE', 'CACHED', 'DEMO'"""
        pass

    @abstractmethod
    async def fetch_slots(self, horizon_date: Optional[str] = None) -> List[PriceSlotModel]:
        """Fetches 96 15-minute price slots normalized into PriceSlotModel"""
        pass
