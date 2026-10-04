import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Dict, Any
from app.database.database import get_db_connection
from app.models.job import JobCreate, JobUpdate, JobResponse
from app.models.price_slot import PriceSlotModel
from app.models.schedule import ScheduleResult, ScheduledJobItem

IST = timezone(timedelta(hours=5, minutes=30))


def now_ist_iso() -> str:
    return datetime.now(IST).isoformat()


class JobRepository:
    @staticmethod
    def get_all() -> List[JobResponse]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            rows = cursor.execute("SELECT * FROM jobs ORDER BY priority DESC, deadline ASC").fetchall()
            return [
                JobResponse(
                    id=row["id"],
                    name=row["name"],
                    duration_minutes=row["duration_minutes"],
                    power_watts=row["power_watts"],
                    deadline=row["deadline"],
                    priority=row["priority"],
                    created_at=row["created_at"],
                    updated_at=row["updated_at"],
                )
                for row in rows
            ]

    @staticmethod
    def get_by_id(job_id: int) -> Optional[JobResponse]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            row = cursor.execute("SELECT * FROM jobs WHERE id = ?", (job_id,)).fetchone()
            if not row:
                return None
            return JobResponse(
                id=row["id"],
                name=row["name"],
                duration_minutes=row["duration_minutes"],
                power_watts=row["power_watts"],
                deadline=row["deadline"],
                priority=row["priority"],
                created_at=row["created_at"],
                updated_at=row["updated_at"],
            )

    @staticmethod
    def create(job_data: JobCreate) -> JobResponse:
        now_str = now_ist_iso()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO jobs (name, duration_minutes, power_watts, deadline, priority, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    job_data.name,
                    job_data.duration_minutes,
                    job_data.power_watts,
                    job_data.deadline,
                    job_data.priority,
                    now_str,
                    now_str,
                ),
            )
            job_id = cursor.lastrowid
            conn.commit()
            return JobRepository.get_by_id(job_id)

    @staticmethod
    def update(job_id: int, job_data: JobUpdate) -> Optional[JobResponse]:
        existing = JobRepository.get_by_id(job_id)
        if not existing:
            return None

        updated_name = job_data.name if job_data.name is not None else existing.name
        updated_duration = job_data.duration_minutes if job_data.duration_minutes is not None else existing.duration_minutes
        updated_power = job_data.power_watts if job_data.power_watts is not None else existing.power_watts
        updated_deadline = job_data.deadline if job_data.deadline is not None else existing.deadline
        updated_priority = job_data.priority if job_data.priority is not None else existing.priority
        now_str = now_ist_iso()

        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                UPDATE jobs
                SET name = ?, duration_minutes = ?, power_watts = ?, deadline = ?, priority = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    updated_name,
                    updated_duration,
                    updated_power,
                    updated_deadline,
                    updated_priority,
                    now_str,
                    job_id,
                ),
            )
            conn.commit()
            return JobRepository.get_by_id(job_id)

    @staticmethod
    def delete(job_id: int) -> bool:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM jobs WHERE id = ?", (job_id,))
            conn.commit()
            return cursor.rowcount > 0

    @staticmethod
    def count() -> int:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            row = cursor.execute("SELECT COUNT(*) AS c FROM jobs").fetchone()
            return row["c"] if row else 0

    @staticmethod
    def clear_all():
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM jobs")
            conn.commit()


class PriceSlotRepository:
    @staticmethod
    def save_slots(delivery_date: str, source: str, slots: List[PriceSlotModel]):
        now_str = now_ist_iso()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM price_slots WHERE delivery_date = ?", (delivery_date,))
            cursor.executemany(
                """
                INSERT INTO price_slots (delivery_date, slot_index, start_time, end_time, price_rs_mwh, price_rs_kwh, source, fetched_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                [
                    (
                        delivery_date,
                        s.index,
                        s.start_time,
                        s.end_time,
                        s.price_rs_mwh,
                        s.price_rs_kwh,
                        source,
                        now_str,
                    )
                    for s in slots
                ],
            )
            conn.commit()

    @staticmethod
    def get_slots_by_date(delivery_date: str) -> List[PriceSlotModel]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            rows = cursor.execute(
                "SELECT * FROM price_slots WHERE delivery_date = ? ORDER BY slot_index ASC",
                (delivery_date,),
            ).fetchall()
            return [
                PriceSlotModel(
                    index=row["slot_index"],
                    start_time=row["start_time"],
                    end_time=row["end_time"],
                    price_rs_mwh=row["price_rs_mwh"],
                    price_rs_kwh=row["price_rs_kwh"],
                    source=row["source"],
                )
                for row in rows
            ]

    @staticmethod
    def get_latest_slots() -> List[PriceSlotModel]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            row = cursor.execute("SELECT delivery_date FROM price_slots ORDER BY fetched_at DESC LIMIT 1").fetchone()
            if not row:
                return []
            return PriceSlotRepository.get_slots_by_date(row["delivery_date"])


class ScheduleRepository:
    @staticmethod
    def save_schedule(schedule: ScheduleResult) -> int:
        now_str = now_ist_iso()
        data_json = schedule.model_dump_json()
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                """
                INSERT INTO schedules (
                    strategy, horizon_start, horizon_end, total_jobs, scheduled_count,
                    unscheduled_count, total_energy_kwh, total_cost_rs, deadline_compliance_rate,
                    data_json, created_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    schedule.strategy,
                    schedule.horizon_start,
                    schedule.horizon_end,
                    schedule.total_jobs,
                    schedule.scheduled_count,
                    schedule.unscheduled_count,
                    schedule.total_energy_kwh,
                    schedule.total_cost_rs,
                    schedule.deadline_compliance_rate,
                    data_json,
                    now_str,
                ),
            )
            inserted_id = cursor.lastrowid
            conn.commit()
            return inserted_id

    @staticmethod
    def get_latest_by_strategy(strategy: str) -> Optional[ScheduleResult]:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            row = cursor.execute(
                "SELECT * FROM schedules WHERE strategy = ? ORDER BY id DESC LIMIT 1",
                (strategy,),
            ).fetchone()
            if not row:
                return None
            data = json.loads(row["data_json"])
            data["id"] = row["id"]
            return ScheduleResult(**data)
