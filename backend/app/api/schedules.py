from fastapi import APIRouter, HTTPException, status
from typing import Optional
from app.models.schedule import ScheduleResult, ScheduleComparisonResponse
from app.database.repositories import ScheduleRepository
from app.services.schedule_service import ScheduleService

router = APIRouter(prefix="/api/schedules", tags=["Schedules"])
schedule_service = ScheduleService()


@router.post("/generate", response_model=ScheduleComparisonResponse)
async def generate_schedule():
    """Generates both Greedy and Baseline schedules and returns full comparison"""
    return await schedule_service.generate_and_compare()


@router.get("/latest", response_model=ScheduleResult)
def get_latest_schedule(strategy: str = "greedy"):
    schedule = ScheduleRepository.get_latest_by_strategy(strategy)
    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No {strategy} schedule has been generated yet.",
        )
    return schedule


@router.get("/comparison", response_model=Optional[ScheduleComparisonResponse])
async def get_schedule_comparison():
    greedy = ScheduleRepository.get_latest_by_strategy("greedy")
    baseline = ScheduleRepository.get_latest_by_strategy("baseline")
    if not greedy or not baseline:
        # Generate automatically if none exists
        return await schedule_service.generate_and_compare()

    abs_savings = round(baseline.total_cost_rs - greedy.total_cost_rs, 2)
    pct_savings = round((abs_savings / baseline.total_cost_rs) * 100.0, 1) if baseline.total_cost_rs > 0 else 0.0

    return ScheduleComparisonResponse(
        greedy=greedy,
        baseline=baseline,
        absolute_savings_rs=abs_savings,
        percentage_savings=pct_savings,
        total_energy_kwh=greedy.total_energy_kwh,
        summary_explanation=(
            f"PowerSched Greedy scheduler achieved ₹{abs_savings:.2f} ({pct_savings}%) lower estimated cost "
            f"than the earliest-start baseline schedule."
        ),
        job_insights=[],
    )
