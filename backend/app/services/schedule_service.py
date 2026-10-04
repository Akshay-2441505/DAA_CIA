from datetime import datetime, timezone, timedelta
from typing import Dict, Any, List, Optional
from app.algorithms.greedy_scheduler import GreedyScheduler
from app.algorithms.baseline_scheduler import BaselineScheduler
from app.models.schedule import ScheduleResult, ScheduledJobItem, ScheduleComparisonResponse
from app.database.repositories import JobRepository, ScheduleRepository
from app.services.price_service import PriceService
from app.services.job_service import JobService

IST = timezone(timedelta(hours=5, minutes=30))


def now_ist_iso() -> str:
    return datetime.now(IST).isoformat()


class ScheduleService:
    def __init__(self, price_service: Optional[PriceService] = None):
        self.price_service = price_service or PriceService()

    async def generate_and_compare(self) -> ScheduleComparisonResponse:
        """
        Runs both Greedy and Baseline algorithms on the exact same jobs and price signals,
        persisting results and returning comparison analytics.
        """
        # Ensure at least demo jobs exist
        jobs = JobRepository.get_all()
        if not jobs:
            JobService.seed_demo_jobs()
            jobs = JobRepository.get_all()

        slots_data, _ = await self.price_service.get_slots()

        # Format jobs and slots for pure algorithms
        jobs_dicts = [
            {
                "id": j.id,
                "name": j.name,
                "duration_minutes": j.duration_minutes,
                "power_watts": j.power_watts,
                "deadline": j.deadline,
                "priority": j.priority,
            }
            for j in jobs
        ]

        slots_dicts = [
            {
                "index": s.index,
                "start_time": s.start_time,
                "end_time": s.end_time,
                "price_rs_kwh": s.price_rs_kwh,
            }
            for s in slots_data
        ]

        horizon_start = slots_data[0].start_time if slots_data else now_ist_iso()
        horizon_end = slots_data[-1].end_time if slots_data else now_ist_iso()

        # 1. Run Greedy
        g_scheduled, g_unscheduled = GreedyScheduler.schedule(jobs_dicts, slots_dicts)
        greedy_result = self._build_result("greedy", horizon_start, horizon_end, jobs_dicts, g_scheduled, g_unscheduled)
        g_id = ScheduleRepository.save_schedule(greedy_result)
        greedy_result.id = g_id

        # 2. Run Baseline
        b_scheduled, b_unscheduled = BaselineScheduler.schedule(jobs_dicts, slots_dicts)
        baseline_result = self._build_result("baseline", horizon_start, horizon_end, jobs_dicts, b_scheduled, b_unscheduled)
        b_id = ScheduleRepository.save_schedule(baseline_result)
        baseline_result.id = b_id

        # 3. Calculate Comparative Analytics
        abs_savings = round(baseline_result.total_cost_rs - greedy_result.total_cost_rs, 2)
        pct_savings = 0.0
        if baseline_result.total_cost_rs > 0:
            pct_savings = round((abs_savings / baseline_result.total_cost_rs) * 100.0, 1)

        summary = (
            f"PowerSched shifted computational workloads to cheaper market-clearing price blocks, "
            f"saving an estimated ₹{abs_savings:.2f} ({pct_savings}%) compared with the earliest-start baseline schedule."
        )

        # Build job-by-job insights
        job_insights = []
        b_map = {j["job_id"]: j for j in b_scheduled}
        for g_job in g_scheduled:
            j_id = g_job["job_id"]
            b_job = b_map.get(j_id)
            if b_job:
                j_save = round(b_job["estimated_cost_rs"] - g_job["estimated_cost_rs"], 2)
                job_insights.append({
                    "job_name": g_job["job_name"],
                    "greedy_window": f"{g_job['start_time'][11:16]} - {g_job['end_time'][11:16]}",
                    "baseline_window": f"{b_job['start_time'][11:16]} - {b_job['end_time'][11:16]}",
                    "greedy_cost": g_job["estimated_cost_rs"],
                    "baseline_cost": b_job["estimated_cost_rs"],
                    "savings_rs": j_save,
                    "explanation": g_job["reason"],
                })

        return ScheduleComparisonResponse(
            greedy=greedy_result,
            baseline=baseline_result,
            absolute_savings_rs=abs_savings,
            percentage_savings=pct_savings,
            total_energy_kwh=greedy_result.total_energy_kwh,
            summary_explanation=summary,
            job_insights=job_insights,
        )

    def _build_result(
        self,
        strategy: str,
        horizon_start: str,
        horizon_end: str,
        all_jobs: List[Dict[str, Any]],
        scheduled_raw: List[Dict[str, Any]],
        unscheduled_raw: List[Dict[str, Any]],
    ) -> ScheduleResult:
        all_scheduled_items = [ScheduledJobItem(**item) for item in (scheduled_raw + unscheduled_raw)]
        total_energy = sum(float(item["energy_kwh"]) for item in scheduled_raw)
        total_cost = sum(float(item["estimated_cost_rs"]) for item in scheduled_raw)


        scheduled_cnt = len(scheduled_raw)
        total_cnt = len(all_jobs)
        unscheduled_cnt = len(unscheduled_raw)

        # Compliance rate: fraction of scheduled jobs that satisfied their deadline
        compliance = (scheduled_cnt / total_cnt * 100.0) if total_cnt > 0 else 0.0

        return ScheduleResult(
            strategy=strategy,
            horizon_start=horizon_start,
            horizon_end=horizon_end,
            total_jobs=total_cnt,
            scheduled_count=scheduled_cnt,
            unscheduled_count=unscheduled_cnt,
            total_energy_kwh=round(total_energy, 4),
            total_cost_rs=round(total_cost, 2),
            deadline_compliance_rate=round(compliance, 1),
            created_at=now_ist_iso(),
            jobs=all_scheduled_items,
        )
