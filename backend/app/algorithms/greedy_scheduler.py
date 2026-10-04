"""
PowerSched Greedy Scheduling Algorithm (DAA Core)
Academic Reference: Deadline-First, Cost-Aware Greedy Strategy
Author: DAA CIA-3 Project Team

Algorithmic Invariants:
1. Non-preemptive execution: Once a job starts, it runs continuously for d_i minutes.
2. Single-resource mutual exclusion: At most one job executes in any 15-minute slot.
3. Deadline feasibility: Every scheduled job finishes at or before its deadline.
4. Greedy Choice:
   - Global Ordering: Earliest Deadline First (EDF), tie-breaking on Priority descending.
   - Local Window Selection: Lowest estimated electricity cost among all currently available contiguous windows.
"""

from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional


def parse_iso(dt_str: str) -> datetime:
    """Parses ISO string to datetime handling 'Z' or offset."""
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00"))


class GreedyScheduler:
    """
    Independent Greedy Scheduling Engine.
    Does NOT depend on FastAPI, SQLite, or web services.
    """

    @staticmethod
    def schedule(
        jobs: List[Dict[str, Any]],
        slots: List[Dict[str, Any]],
    ) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Executes the Deadline-First, Cost-Aware Greedy Algorithm.

        Parameters:
        - jobs: List of job dictionaries with keys:
            ['id', 'name', 'duration_minutes', 'power_watts', 'deadline', 'priority']
        - slots: List of 15-minute time slot dictionaries with keys:
            ['index', 'start_time', 'end_time', 'price_rs_kwh']

        Returns:
        - (scheduled_jobs, unscheduled_jobs)
        """
        if not jobs or not slots:
            return [], [
                {
                    "job_id": j.get("id", idx),
                    "job_name": j.get("name", f"Job-{idx}"),
                    "status": "unscheduled",
                    "reason": "No price slots available for scheduling horizon.",
                    "duration_minutes": j.get("duration_minutes", 0),
                    "power_watts": j.get("power_watts", 0.0),
                    "energy_kwh": 0.0,
                    "estimated_cost_rs": 0.0,
                    "deadline": str(j.get("deadline", "")),
                    "priority": j.get("priority", 1),
                }
                for idx, j in enumerate(jobs)
            ]

        # 1. Greedy Job Ordering:
        # Sort primary: Ascending deadline (EDF)
        # Sort secondary: Descending priority
        sorted_jobs = sorted(
            jobs,
            key=lambda j: (
                parse_iso(str(j["deadline"])),
                -int(j.get("priority", 1)),
                int(j.get("duration_minutes", 0)),
            ),
        )

        T = len(slots)
        occupied = [False] * T

        # Precompute prefix sums of slot prices for O(1) window cost calculation
        # prefix_prices[k] = sum(slots[0..k-1].price_rs_kwh)
        prefix_prices = [0.0] * (T + 1)
        for i in range(T):
            prefix_prices[i + 1] = prefix_prices[i] + float(slots[i]["price_rs_kwh"])

        # Pre-parse slot end times for rapid deadline checks
        slot_end_times = [parse_iso(slots[i]["end_time"]) for i in range(T)]

        scheduled_jobs: List[Dict[str, Any]] = []
        unscheduled_jobs: List[Dict[str, Any]] = []

        # 2. Iterate through each job in greedy order
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

            best_window_start: Optional[int] = None
            min_window_cost = float("inf")
            reason_for_rejection: Optional[str] = None
            encountered_any_before_deadline = False

            # Search all contiguous windows of length required_slots
            max_start_idx = T - required_slots
            if max_start_idx < 0:
                reason_for_rejection = (
                    f"Job duration ({duration_minutes}m) exceeds scheduling horizon ({T * 15}m)."
                )

            for start_idx in range(max_start_idx + 1):
                end_idx = start_idx + required_slots  # exclusive
                last_slot_idx = end_idx - 1

                # Feasibility Check 1: Must finish before deadline
                if slot_end_times[last_slot_idx] > deadline_dt:
                    # Since slots are chronologically ordered, future start_idx will also exceed deadline
                    break

                encountered_any_before_deadline = True

                # Feasibility Check 2: All slots in window must be unoccupied
                if any(occupied[start_idx:end_idx]):
                    continue

                # Calculate window cost in O(1) via prefix sums
                # Window price sum = prefix_prices[end_idx] - prefix_prices[start_idx]
                window_price_sum = prefix_prices[end_idx] - prefix_prices[start_idx]
                candidate_cost = slot_energy_kwh * window_price_sum

                # Greedy choice: minimize estimated cost
                if candidate_cost < min_window_cost:
                    min_window_cost = candidate_cost
                    best_window_start = start_idx

            if best_window_start is not None:
                # Assign to cheapest window
                chosen_end_idx = best_window_start + required_slots
                for s_idx in range(best_window_start, chosen_end_idx):
                    occupied[s_idx] = True

                start_slot = slots[best_window_start]
                end_slot = slots[chosen_end_idx - 1]
                slot_indices = list(range(best_window_start, chosen_end_idx))
                avg_window_price = (prefix_prices[chosen_end_idx] - prefix_prices[best_window_start]) / required_slots

                scheduled_jobs.append(
                    {
                        "job_id": job_id,
                        "job_name": job_name,
                        "start_time": start_slot["start_time"],
                        "end_time": end_slot["end_time"],
                        "slot_indexes": slot_indices,
                        "duration_minutes": duration_minutes,
                        "power_watts": power_watts,
                        "energy_kwh": round(total_job_energy_kwh, 4),
                        "estimated_cost_rs": round(min_window_cost, 2),
                        "status": "scheduled",
                        "reason": (
                            f"Placed in cheapest feasible {duration_minutes}m window "
                            f"(avg ₹{avg_window_price:.2f}/kWh) respecting deadline {deadline_dt.strftime('%H:%M')}."
                        ),
                        "deadline": deadline_str,
                        "priority": priority,
                    }
                )
            else:
                if not encountered_any_before_deadline:
                    diag = f"Deadline ({deadline_dt.strftime('%H:%M')}) is earlier than minimum completion time."
                else:
                    diag = "All feasible windows before deadline were already occupied by higher-priority workloads."

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
                        "reason": reason_for_rejection or diag,
                        "deadline": deadline_str,
                        "priority": priority,
                    }
                )

        return scheduled_jobs, unscheduled_jobs
