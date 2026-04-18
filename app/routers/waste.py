from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app import mock_store as store
from app.schemas import SinkDetailResponse, SinkListResponse, SinkSummary, WasteSummaryResponse

router = APIRouter(prefix="/api", tags=["waste"])


@router.get("/waste/summary", response_model=WasteSummaryResponse)
def waste_summary(
    start: date | None = Query(None, description="Period start (inclusive), ISO date"),
    end: date | None = Query(None, description="Period end (inclusive), ISO date"),
    days: int = Query(30, ge=1, le=366, description="If start/end omitted, last N days ending today"),
) -> WasteSummaryResponse:
    """Overall wasted water for all sinks, with per-day breakdown for charts."""
    s, e, ev = store.all_events_in_period(start, end, default_days=days)
    total = sum(x.volume_ml for x in ev)
    by_day = store.daily_series(ev, s, e)
    return WasteSummaryResponse(
        period_start=s,
        period_end=e,
        total_volume_ml=round(total, 1),
        by_day=by_day,
    )


@router.get("/sinks", response_model=SinkListResponse)
def list_sinks(
    start: date | None = Query(None),
    end: date | None = Query(None),
    days: int = Query(30, ge=1, le=366),
) -> SinkListResponse:
    """All sinks with total waste in the period (for the sink list screen)."""
    s, e, ev_all = store.all_events_in_period(start, end, default_days=days)
    by_sink: dict[str, float] = {}
    for ev in ev_all:
        by_sink[ev.sink_id] = by_sink.get(ev.sink_id, 0.0) + ev.volume_ml
    sinks_out = [
        SinkSummary(
            id=base.id,
            name=base.name,
            location=base.location,
            total_volume_ml=round(by_sink.get(base.id, 0.0), 1),
        )
        for base in store.list_sink_bases()
    ]
    return SinkListResponse(period_start=s, period_end=e, sinks=sinks_out)


@router.get("/sinks/{sink_id}", response_model=SinkDetailResponse)
def sink_detail(
    sink_id: str,
    start: date | None = Query(None),
    end: date | None = Query(None),
    days: int = Query(30, ge=1, le=366),
) -> SinkDetailResponse:
    """One sink: totals, daily series, and recent usage events."""
    base = store.get_sink(sink_id)
    if base is None:
        raise HTTPException(status_code=404, detail="Sink not found")
    s, e, ev = store.all_events_in_period(start, end, default_days=days, sink_id=sink_id)
    total = sum(x.volume_ml for x in ev)
    by_day = store.daily_series(ev, s, e)
    recent = store.recent_events_for_sink(sink_id, limit=40)
    recent = [x for x in recent if s <= x.at.date() <= e]
    return SinkDetailResponse(
        id=base.id,
        name=base.name,
        location=base.location,
        period_start=s,
        period_end=e,
        total_volume_ml=round(total, 1),
        by_day=by_day,
        recent_events=sorted(recent, key=lambda x: x.at, reverse=True),
    )
