from fastapi import APIRouter
from app.models.price_slot import PriceHorizonResponse, CurrentPriceResponse
from app.services.price_service import PriceService

router = APIRouter(prefix="/api/prices", tags=["Prices"])
price_service = PriceService()


@router.get("/current", response_model=CurrentPriceResponse)
async def get_current_price():
    return await price_service.get_current_price_status()


@router.get("/today", response_model=PriceHorizonResponse)
async def get_today_prices():
    return await price_service.get_today_horizon(force_refresh=False)


@router.post("/refresh", response_model=PriceHorizonResponse)
async def refresh_prices():
    return await price_service.get_today_horizon(force_refresh=True)
