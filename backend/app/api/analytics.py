from fastapi import APIRouter
from typing import Dict, Any
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])
analytics_service = AnalyticsService()


@router.get("/summary")
async def get_analytics_summary() -> Dict[str, Any]:
    return await analytics_service.get_overview_summary()
