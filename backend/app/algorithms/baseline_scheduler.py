"""
PowerSched Baseline Scheduler (Earliest-Start / First-Fit)
Academic Reference: Serves as experimental control to quantify savings from temporal shifting.

Algorithmic Invariants:
1. Non-preemptive execution.
2. Single-resource mutual exclusion.
3. Earliest-Start Strategy: Chooses the very FIRST available contiguous window finishing before deadline,
   completely ignoring time-varying electricity prices.
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional


def parse_iso(dt_str: str) -> datetime:
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))


class BaselineScheduler:
    """
    Baseline Earliest-Start Scheduler without price awareness.
    Used for empirical algorithmic comparison against PowerSched Greedy Scheduler.
    """

    @staticmethod
    def schedule(
        jobs: List[Dict[str, Any]],
        slots: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        if not jobs or not slots:
            return [], []

        # Sort primarily by deadline, then priority
        sorted_jobs = sorted(
            jobs,
            key=lambda j: (
                parse_iso(str(j["deadline"])),
                -int(j.get("priority", 1)),
            ),
        )

        T = len(slots)
        occupied = [False] * T
        slot_end_times = [parse_iso(slots[i]["end_time"]) for i in range(T)]

        scheduled_jobs: List[Dict[str, Any]] = []
        unscheduled_jobs: List[Dict[str, Any]] = []

        for job in sorted_jobs:
            job_id = job.get("id", 0)
            job_name = job.get("name", "Unknown Job")
            duration_minutes = int(job.get("duration_minutes", 15))
            power_watts = float(job.get("power_watts", 0.0))
            priority = int(job.get("priority", 1))
            deadline_str = str(job.get("deadline", ""))
            deadline_dt = parse_iso(deadline_str)

            required_slots = duration_minutes // 15
            power_kw = power_watts / 1000.0
            slot_energy_kwh = power_kw * 0.25
            total_job_energy_kwh = slot_energy_kwh * required_slots

            earliest_window_start: Optional[int] = None
            max_start_idx = T - required_slots

            for start_idx in range(max_start_idx + 1):
                end_idx = start_idx + required_slots
                last_slot_idx = end_idx - 1

                if slot_end_times[last_slot_idx] > deadline_dt:
                    break

                if any(occupied[start_idx:end_idx]):
                    continue

                # First feasible window encountered is selected
                earliest_window_start = start_idx
                break

            if earliest_window_start is not None:
                chosen_end_idx = earliest_window_start + required_slots
                for s_idx in range(earliest_window_start, chosen_end_idx):
                    occupied[s_idx] = True

                window_slots = slots[earliest_window_start:chosen_end_idx]
                cost = sum(slot_energy_kwh * float(s["price_rs_kwh"]) for s in window_slots)
                slot_indices = list(range(earliest_window_start, chosen_end_idx))

                scheduled_jobs.append(
                    {
                        "job_id": job_id,
                        "job_name": job_name,
                        "start_time": window_slots[0]["start_time"],
                        "end_time": window_slots[-1]["end_time"],
                        "slot_indexes": slot_indices,
                        "duration_minutes": duration_minutes,
                        "power_watts": power_watts,
                        "energy_kwh": round(total_job_energy_kwh, 4),
                        "estimated_cost_rs": round(cost, 2),
                        "status": "scheduled",
                        "reason": f"Placed in earliest available {duration_minutes}m window (Baseline first-fit).",
                        "deadline": deadline_str,
                        "priority": priority,
                    }
                )
            else:
                unscheduled_jobs.append(
                    {
                        "job_id": job_id,
                        "job_name": job_name,
                        "start_time": None,
                        "end_time": None,
                        "slot_indexes": [],
                        "duration_minutes": duration_minutes,
                        "power_watts": power_watts,
                        "energy_kwh": round(total_job_energy_kwh, 4),
                        "estimated_cost_rs": 0.0,
                        "status": "unscheduled",
                        "reason": "No available window before deadline (Baseline).",
                        "deadline": deadline_str,
                        "priority": priority,
                    }
                )

        return scheduled_jobs, unscheduled_jobs
