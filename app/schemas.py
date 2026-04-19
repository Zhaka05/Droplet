from datetime import date, datetime
from typing import List

from pydantic import BaseModel, Field, model_validator


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


class WasteIngestRequest(BaseModel):
    """Payload your Arduino (or gateway) can POST after each sink use."""

    sink_id: str = Field(min_length=1, description="Stable id, e.g. kitchen-main")
    volume_ml: float | None = Field(default=None, ge=0)
    volume_l: float | None = Field(default=None, ge=0)
    at: datetime | None = Field(
        default=None,
        description="Event time; omit to use server time (UTC)",
    )
    sink_name: str | None = Field(
        default=None,
        description="If sink_id is new, used as display name (defaults to sink_id)",
    )
    location: str | None = Field(default=None, description="Optional room/area label")

    @model_validator(mode="after")
    def _one_volume(self) -> "WasteIngestRequest":
        if self.volume_ml is None and self.volume_l is None:
            raise ValueError("Provide volume_ml or volume_l")
        if self.volume_ml is not None and self.volume_l is not None:
            raise ValueError("Provide only one of volume_ml or volume_l")
        return self


class WasteIngestResponse(BaseModel):
    id: str
    sink_id: str
    at: datetime
    volume_ml: float
