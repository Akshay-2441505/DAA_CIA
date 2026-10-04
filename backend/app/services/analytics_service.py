from typing import Dict, Any, Optional
from app.database.repositories import JobRepository, ScheduleRepository
from app.services.price_service import PriceService


class AnalyticsService:
    def __init__(self, price_service: Optional[PriceService] = None):
        self.price_service = price_service or PriceService()

    async def get_overview_summary(self) -> Dict[str, Any]:
        price_status = await self.price_service.get_current_price_status()
        greedy_schedule = ScheduleRepository.get_latest_by_strategy("greedy")
        baseline_schedule = ScheduleRepository.get_latest_by_strategy("baseline")

        total_jobs_count = JobRepository.count()

        if greedy_schedule and baseline_schedule:
            powersched_cost = greedy_schedule.total_cost_rs
            baseline_cost = baseline_schedule.total_cost_rs
            savings_rs = round(baseline_cost - powersched_cost, 2)
            savings_pct = (
                round((savings_rs / baseline_cost) * 100.0, 1) if baseline_cost > 0 else 0.0
            )
            scheduled_count = greedy_schedule.scheduled_count
            unscheduled_count = greedy_schedule.unscheduled_count
            total_energy = greedy_schedule.total_energy_kwh
            deadline_compliance = greedy_schedule.deadline_compliance_rate
        else:
            powersched_cost = 0.0
            baseline_cost = 0.0
            savings_rs = 0.0
            savings_pct = 0.0
            scheduled_count = 0
            unscheduled_count = 0
            total_energy = 0.0
            deadline_compliance = 100.0

        current_price_kwh = (
            price_status.current_slot.price_rs_kwh if price_status.current_slot else 0.0
        )

        return {
            "current_price_signal": {
                "price_rs_kwh": current_price_kwh,
                "price_rs_mwh": current_price_kwh * 1000.0,
                "market": "IEX DAM",
                "source": price_status.source,
                "timestamp": price_status.current_time,
            },
            "cheapest_window": price_status.cheapest_upcoming_window,
            "jobs_summary": {
                "total_jobs": total_jobs_count,
                "scheduled": scheduled_count,
                "unscheduled": unscheduled_count,
                "deadline_compliance": deadline_compliance,
            },
            "energy_metrics": {
                "total_energy_kwh": total_energy,
                "powersched_cost_rs": powersched_cost,
                "baseline_cost_rs": baseline_cost,
                "estimated_savings_rs": savings_rs,
                "estimated_savings_pct": savings_pct,
            },
            "highlight_insight": (
                f"PowerSched reduced estimated cost by ₹{savings_rs:.2f} ({savings_pct}%) "
                f"by allocating flexible workloads to lowest-priced market blocks."
                if savings_rs > 0
                else "Generate a schedule to view cost-saving temporal shift opportunities."
            ),
        }
