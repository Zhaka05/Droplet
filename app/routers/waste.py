from datetime import date

from fastapi import APIRouter, HTTPException, Query

from app import mock_store as store
from app.schemas import (
    SinkDetailResponse,
    SinkListResponse,
    SinkSummary,
    WasteIngestRequest,
    WasteIngestResponse,
    WasteSummaryResponse,
)

router = APIRouter(prefix="/api", tags=["waste"])


@router.post("/waste/events", response_model=WasteIngestResponse)
def ingest_waste_event(body: WasteIngestRequest) -> WasteIngestResponse:
    """Receive one approximate waste reading.

    For hardware on a **USB cable** to the same PC as the API, use the local bridge
    ``scripts/serial_to_api.py`` (reads Serial lines, POSTs here to ``127.0.0.1``).
    """
    ml = body.volume_ml if body.volume_ml is not None else (body.volume_l or 0) * 1000.0
    ev = store.add_waste_event(
        sink_id=body.sink_id,
        volume_ml=ml,
        at=body.at,
        sink_name=body.sink_name,
        location=body.location,
    )
    return WasteIngestResponse(
        id=ev.id,
        sink_id=ev.sink_id,
        at=ev.at,
        volume_ml=ev.volume_ml,
    )


@router.get("/waste/summary", response_model=WasteSummaryResponse)
def waste_summary(
    start: date | None = Query(None, description="Period start (inclusive), ISO date"),
    end: date | None = Query(None, description="Period end (inclusive), ISO date"),
    days: int = Query(30, ge=1, le=366, description="If start/end omitted, last N days ending today"),
) -> WasteSummaryResponse:
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
    base = store.get_sink(sink_id)
    if base is None:
        raise HTTPException(status_code=404, detail="Sink not found")
    s, e, ev = store.all_events_in_period(start, end, default_days=days, sink_id=sink_id)
    total = sum(x.volume_ml for x in ev)
    by_day = store.daily_series(ev, s, e)
    recent = store.recent_events_in_period(sink_id, s, e, limit=60)
    return SinkDetailResponse(
        id=base.id,
        name=base.name,
        location=base.location,
        period_start=s,
        period_end=e,
        total_volume_ml=round(total, 1),
        by_day=by_day,
        recent_events=recent,
    )
