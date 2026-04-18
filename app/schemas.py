from datetime import date, datetime
from typing import List

from pydantic import BaseModel, Field


class WasteEvent(BaseModel):
    id: str
    sink_id: str
    at: datetime
    volume_ml: float = Field(ge=0, description="Approximate water wasted this use, in milliliters")


class SinkBase(BaseModel):
    id: str
    name: str
    location: str | None = None


class SinkSummary(SinkBase):
    total_volume_ml: float = Field(ge=0, description="Total waste in the requested period")


class DailyWaste(BaseModel):
    day: date
    volume_ml: float = Field(ge=0)


class WasteSummaryResponse(BaseModel):
    period_start: date
    period_end: date
    total_volume_ml: float
    by_day: List[DailyWaste]


class SinkDetailResponse(SinkBase):
    period_start: date
    period_end: date
    total_volume_ml: float
    by_day: List[DailyWaste]
    recent_events: List[WasteEvent]


class SinkListResponse(BaseModel):
    period_start: date
    period_end: date
    sinks: List[SinkSummary]
