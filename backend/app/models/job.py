from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, ConfigDict


class JobBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=80, description="Job name")
    duration_minutes: int = Field(..., ge=15, le=1440, description="Duration in minutes (multiple of 15)")
    power_watts: float = Field(..., gt=0, description="Estimated power consumption in Watts")
    deadline: str = Field(..., description="ISO 8601 string for completion deadline")
    priority: int = Field(default=3, ge=1, le=5, description="Priority from 1 (lowest) to 5 (highest)")

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration_step(cls, v: int) -> int:
        if v % 15 != 0:
            raise ValueError("Duration must be in 15-minute increments (divisible by 15).")
        return v

    @field_validator("deadline")
    @classmethod
    def validate_deadline_format(cls, v: str) -> str:
        try:
            # Check if it parses as ISO datetime
            datetime.fromisoformat(v.replace("Z", "+00:00"))
        except Exception as e:
            raise ValueError(f"Invalid deadline format. Must be a valid ISO 8601 string: {e}")
        return v


class JobCreate(JobBase):
    pass


class JobUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=80)
    duration_minutes: Optional[int] = Field(None, ge=15, le=1440)
    power_watts: Optional[float] = Field(None, gt=0)
    deadline: Optional[str] = None
    priority: Optional[int] = Field(None, ge=1, le=5)

    @field_validator("duration_minutes")
    @classmethod
    def validate_duration_step(cls, v: Optional[int]) -> Optional[int]:
        if v is not None and v % 15 != 0:
            raise ValueError("Duration must be in 15-minute increments (divisible by 15).")
        return v


class JobResponse(JobBase):
    id: int
    created_at: str
    updated_at: str
    model_config = ConfigDict(from_attributes=True)

