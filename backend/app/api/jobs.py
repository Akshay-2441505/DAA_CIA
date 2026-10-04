from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.job import JobCreate, JobUpdate, JobResponse
from app.services.job_service import JobService

router = APIRouter(prefix="/api/jobs", tags=["Jobs"])


@router.get("", response_model=List[JobResponse])
def get_jobs():
    return JobService.list_jobs()


@router.post("", response_model=JobResponse, status_code=status.HTTP_201_CREATED)
def create_job(job_in: JobCreate):
    return JobService.create_job(job_in)


@router.get("/{job_id}", response_model=JobResponse)
def get_job(job_id: int):
    job = JobService.get_job(job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found."
        )
    return job


@router.put("/{job_id}", response_model=JobResponse)
def update_job(job_id: int, job_in: JobUpdate):
    updated = JobService.update_job(job_id, job_in)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found."
        )
    return updated


@router.delete("/{job_id}")
def delete_job(job_id: int):
    success = JobService.delete_job(job_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {job_id} not found."
        )
    return {"success": True, "message": f"Job {job_id} deleted successfully."}


@router.post("/seed-demo", response_model=List[JobResponse])
def seed_demo_jobs():
    """Seeds or resets the deterministic academic demo workloads (8 jobs)"""
    return JobService.seed_demo_jobs()
