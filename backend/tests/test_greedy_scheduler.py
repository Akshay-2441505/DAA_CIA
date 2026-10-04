import pytest
from datetime import datetime, timezone, timedelta
from app.algorithms.greedy_scheduler import GreedyScheduler
from app.algorithms.baseline_scheduler import BaselineScheduler

IST = timezone(timedelta(hours=5, minutes=30))
BASE_DATE = datetime(2026, 10, 5, 0, 0, 0, tzinfo=IST)


def make_slots(prices):
    """Helper to create slots from a list of prices in Rs/kWh"""
    slots = []
    for i, p in enumerate(prices):
        st = BASE_DATE + timedelta(minutes=15 * i)
        et = st + timedelta(minutes=15)
        slots.append({
            "index": i,
            "start_time": st.isoformat(),
            "end_time": et.isoformat(),
            "price_rs_kwh": p,
        })
    return slots


def test_single_job_picks_cheapest_window():
    # 8 slots: prices [5.0, 5.0, 2.0, 2.0, 6.0, 6.0, 7.0, 7.0]
    # Job requires 30 mins (2 slots), deadline at slot 8 (end of horizon)
    prices = [5.0, 5.0, 2.0, 2.0, 6.0, 6.0, 7.0, 7.0]
    slots = make_slots(prices)
    deadline = (BASE_DATE + timedelta(minutes=15 * 8)).isoformat()

    jobs = [{
        "id": 1,
        "name": "Quick Task",
        "duration_minutes": 30,
        "power_watts": 1000.0,  # 1 kW
        "deadline": deadline,
        "priority": 3,
    }]

    scheduled, unscheduled = GreedyScheduler.schedule(jobs, slots)
    assert len(scheduled) == 1
    assert len(unscheduled) == 0

    item = scheduled[0]
    # Slots 2 and 3 have prices 2.0 and 2.0 (sum = 4.0).
    # Cost = 1 kW * 0.25h * (2.0 + 2.0) = 1.0 Rs
    assert item["slot_indexes"] == [2, 3]
    assert item["estimated_cost_rs"] == 1.0


def test_greedy_vs_baseline_savings():
    # Baseline picks earliest (slot 0, 1 @ 5.0 + 5.0 -> 2.5 Rs)
    # Greedy picks slot 2, 3 @ 2.0 + 2.0 -> 1.0 Rs
    prices = [5.0, 5.0, 2.0, 2.0, 6.0, 6.0, 7.0, 7.0]
    slots = make_slots(prices)
    deadline = (BASE_DATE + timedelta(minutes=15 * 8)).isoformat()

    jobs = [{
        "id": 1,
        "name": "Shiftable Task",
        "duration_minutes": 30,
        "power_watts": 1000.0,
        "deadline": deadline,
        "priority": 3,
    }]

    g_sched, _ = GreedyScheduler.schedule(jobs, slots)
    b_sched, _ = BaselineScheduler.schedule(jobs, slots)

    assert b_sched[0]["slot_indexes"] == [0, 1]
    assert b_sched[0]["estimated_cost_rs"] == 2.5
    assert g_sched[0]["slot_indexes"] == [2, 3]
    assert g_sched[0]["estimated_cost_rs"] == 1.0
    assert g_sched[0]["estimated_cost_rs"] < b_sched[0]["estimated_cost_rs"]


def test_priority_tie_break():
    # Two jobs with the exact same deadline competing for 1 cheap slot
    prices = [8.0, 1.0, 8.0]
    slots = make_slots(prices)
    deadline = (BASE_DATE + timedelta(minutes=45)).isoformat()

    jobs = [
        {"id": 1, "name": "Low Priority", "duration_minutes": 15, "power_watts": 500, "deadline": deadline, "priority": 1},
        {"id": 2, "name": "High Priority", "duration_minutes": 15, "power_watts": 500, "deadline": deadline, "priority": 5},
    ]

    scheduled, _ = GreedyScheduler.schedule(jobs, slots)
    # High Priority should get slot 1 (price 1.0)
    high_p = next(j for j in scheduled if j["job_id"] == 2)
    low_p = next(j for j in scheduled if j["job_id"] == 1)

    assert high_p["slot_indexes"] == [1]
    assert low_p["slot_indexes"] in [[0], [2]]


def test_infeasible_job_reported():
    prices = [3.0, 3.0]
    slots = make_slots(prices)
    # Deadline is 15 mins from start, but job needs 30 mins
    deadline = (BASE_DATE + timedelta(minutes=15)).isoformat()

    jobs = [{
        "id": 1,
        "name": "Impossible Job",
        "duration_minutes": 30,
        "power_watts": 1000,
        "deadline": deadline,
        "priority": 3,
    }]

    scheduled, unscheduled = GreedyScheduler.schedule(jobs, slots)
    assert len(scheduled) == 0
    assert len(unscheduled) == 1
    assert unscheduled[0]["status"] == "unscheduled"
    assert "earlier than minimum completion time" in unscheduled[0]["reason"]


def test_no_slot_overlap():
    # 4 jobs of 15 min each in 4 slots
    prices = [4.0, 2.0, 1.0, 5.0]
    slots = make_slots(prices)
    deadline = (BASE_DATE + timedelta(minutes=60)).isoformat()

    jobs = [
        {"id": i, "name": f"Job {i}", "duration_minutes": 15, "power_watts": 1000, "deadline": deadline, "priority": i}
        for i in range(1, 5)
    ]

    scheduled, unscheduled = GreedyScheduler.schedule(jobs, slots)
    assert len(scheduled) == 4
    all_assigned_slots = [j["slot_indexes"][0] for j in scheduled]
    # Ensure all slots are distinct (no collision)
    assert len(set(all_assigned_slots)) == 4
