from datetime import datetime, timezone, timedelta
from typing import List, Optional
from app.models.job import JobCreate, JobUpdate, JobResponse
from app.database.repositories import JobRepository

IST = timezone(timedelta(hours=5, minutes=30))


class JobService:
    @staticmethod
    def list_jobs() -> List[JobResponse]:
        return JobRepository.get_all()

    @staticmethod
    def get_job(job_id: int) -> Optional[JobResponse]:
        return JobRepository.get_by_id(job_id)

    @staticmethod
    def create_job(job_in: JobCreate) -> JobResponse:
        return JobRepository.create(job_in)

    @staticmethod
    def update_job(job_id: int, job_in: JobUpdate) -> Optional[JobResponse]:
        return JobRepository.update(job_id, job_in)

    @staticmethod
    def delete_job(job_id: int) -> bool:
        return JobRepository.delete(job_id)

    @staticmethod
    def seed_demo_jobs() -> List[JobResponse]:
        """
        Populates standard academic demo dataset:
        8 workloads including flexible jobs, tight deadlines, and 1 infeasible job.
        """
        JobRepository.clear_all()
        today = datetime.now(IST).replace(hour=0, minute=0, second=0, microsecond=0)

        demo_jobs_data = [
            # 1. Flexible job that can shift to overnight off-peak trough (02:00 - 06:00)
            JobCreate(
                name="ML Model Training",
                duration_minutes=240,  # 4 hours
                power_watts=800.0,
                deadline=(today + timedelta(hours=8, minutes=0)).isoformat(),  # 08:00 AM
                priority=5,
            ),
            # 2. Database Backup (flexible overnight)
            JobCreate(
                name="Database Backup",
                duration_minutes=60,  # 1 hour
                power_watts=450.0,
                deadline=(today + timedelta(hours=7, minutes=30)).isoformat(),  # 07:30 AM
                priority=4,
            ),
            # 3. Morning Report Generation
            JobCreate(
                name="Executive Report Generation",
                duration_minutes=45,
                power_watts=350.0,
                deadline=(today + timedelta(hours=10, minutes=0)).isoformat(),  # 10:00 AM
                priority=3,
            ),
            # 4. Data Sync
            JobCreate(
                name="Cloud Storage Data Sync",
                duration_minutes=90,
                power_watts=250.0,
                deadline=(today + timedelta(hours=14, minutes=0)).isoformat(),  # 02:00 PM
                priority=3,
            ),
            # 5. Video Rendering (can shift into solar dip 11:00 - 15:00)
            JobCreate(
                name="4K Video Rendering",
                duration_minutes=120,
                power_watts=1200.0,
                deadline=(today + timedelta(hours=18, minutes=0)).isoformat(),  # 06:00 PM
                priority=4,
            ),
            # 6. Analytics Batch
            JobCreate(
                name="Daily Analytics Batch",
                duration_minutes=90,
                power_watts=500.0,
                deadline=(today + timedelta(hours=20, minutes=0)).isoformat(),  # 08:00 PM
                priority=2,
            ),
            # 7. Customer Notification Batch
            JobCreate(
                name="Notification Dispatch Batch",
                duration_minutes=30,
                power_watts=200.0,
                deadline=(today + timedelta(hours=21, minutes=30)).isoformat(),  # 09:30 PM
                priority=1,
            ),
            # 8. Intentionally Infeasible Job (Impossible deadline: 120 mins requested before 01:00 AM)
            JobCreate(
                name="Infeasible Express Archive",
                duration_minutes=120,  # 2 hours required
                power_watts=600.0,
                deadline=(today + timedelta(hours=1, minutes=0)).isoformat(),  # 01:00 AM deadline
                priority=5,
            ),
        ]

        created = []
        for j in demo_jobs_data:
            created.append(JobRepository.create(j))
        return created
