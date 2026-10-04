from typing import List, Optional
from pydantic import BaseModel, Field


class ScheduledJobItem(BaseModel):
    job_id: int
    job_name: str
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    slot_indexes: List[int] = Field(default_factory=list)
    duration_minutes: int
    power_watts: float
    energy_kwh: float
    estimated_cost_rs: float
    status: str = Field(..., description="'scheduled' or 'unscheduled'")
    reason: Optional[str] = None
    deadline: str
    priority: int


class ScheduleResult(BaseModel):
    id: Optional[int] = None
    strategy: str = Field(..., description="'greedy' or 'baseline'")
    horizon_start: str
    horizon_end: str
    total_jobs: int
    scheduled_count: int
    unscheduled_count: int
    total_energy_kwh: float
    total_cost_rs: float
    deadline_compliance_rate: float
    created_at: str
    jobs: List[ScheduledJobItem]


class ScheduleGenerateRequest(BaseModel):
    horizon_start: Optional[str] = None
    horizon_end: Optional[str] = None


class ScheduleComparisonResponse(BaseModel):
    greedy: ScheduleResult
    baseline: ScheduleResult
    absolute_savings_rs: float
    percentage_savings: float
    total_energy_kwh: float
    summary_explanation: str
    job_insights: List[dict] = Field(default_factory=list)
