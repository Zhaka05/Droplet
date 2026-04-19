"""In-memory readings. Arduino (or any client) POSTs events; optional demo seed."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Iterable, List, Sequence, Tuple
from uuid import uuid4

from app.schemas import DailyWaste, SinkBase, WasteEvent

UTC = timezone.utc


def _midnight_utc(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=UTC)


def _build_demo_events() -> List[WasteEvent]:
    """A handful of events so the UI is not empty before hardware is connected."""
    today = date.today()
    sinks = [
        ("kitchen-main", "Kitchen main", "Kitchen"),
        ("bath-up", "Upstairs bath", "Bathroom"),
    ]
    events: List[WasteEvent] = []
    for i, (sid, _, _) in enumerate(sinks):
        d = today - timedelta(days=2 - i)
        at = _midnight_utc(d).replace(hour=8 + i, minute=12, second=0)
        events.append(
            WasteEvent(
                id=str(uuid4()),
                sink_id=sid,
                at=at,
                volume_ml=round(120.0 + i * 85.0, 1),
            )
        )
    return events


_EVENTS: List[WasteEvent] = _build_demo_events()

_SINKS: List[SinkBase] = [
    SinkBase(id="kitchen-main", name="Kitchen main", location="Kitchen"),
    SinkBase(id="bath-up", name="Upstairs bath", location="Bathroom"),
    SinkBase(id="utility", name="Utility sink", location="Basement"),
]


def list_sink_bases() -> List[SinkBase]:
    return list(_SINKS)


def get_sink(sink_id: str) -> SinkBase | None:
    for s in _SINKS:
        if s.id == sink_id:
            return s
    return None


def ensure_sink(sink_id: str, name: str | None, location: str | None) -> SinkBase:
    existing = get_sink(sink_id)
    if existing:
        return existing
    base = SinkBase(
        id=sink_id,
        name=name or sink_id.replace("-", " ").title(),
        location=location,
    )
    _SINKS.append(base)
    return base


def add_waste_event(
    sink_id: str,
    volume_ml: float,
    at: datetime | None,
    sink_name: str | None,
    location: str | None,
) -> WasteEvent:
    """Append one usage reading (Arduino-friendly)."""
    ensure_sink(sink_id, sink_name, location)
    when = at.astimezone(UTC) if at is not None else datetime.now(tz=UTC)
    ev = WasteEvent(
        id=str(uuid4()),
        sink_id=sink_id,
        at=when,
        volume_ml=round(float(volume_ml), 2),
    )
    _EVENTS.append(ev)
    return ev


def _events_in_range(
    events: Iterable[WasteEvent],
    start: datetime,
    end: datetime,
    sink_id: str | None = None,
) -> List[WasteEvent]:
    out: List[WasteEvent] = []
    for e in events:
        if sink_id is not None and e.sink_id != sink_id:
            continue
        if start <= e.at < end:
            out.append(e)
    out.sort(key=lambda x: x.at)
    return out


def aggregate_by_day(events: Sequence[WasteEvent]) -> dict[date, float]:
    by: dict[date, float] = defaultdict(float)
    for e in events:
        by[e.at.date()] += e.volume_ml
    return dict(by)


def period_bounds(
    start: date | None,
    end: date | None,
    default_days: int = 30,
) -> Tuple[date, date, datetime, datetime]:
    """Inclusive start/end dates; event filter uses [start_dt, end_dt)."""
    end_d = end or date.today()
    start_d = start or (end_d - timedelta(days=default_days - 1))
    if start_d > end_d:
        start_d, end_d = end_d, start_d
    start_dt = _midnight_utc(start_d)
    end_dt = _midnight_utc(end_d) + timedelta(days=1)
    return start_d, end_d, start_dt, end_dt


def all_events_in_period(
    start: date | None,
    end: date | None,
    default_days: int = 30,
    sink_id: str | None = None,
) -> Tuple[date, date, List[WasteEvent]]:
    start_d, end_d, start_dt, end_dt = period_bounds(start, end, default_days)
    ev = _events_in_range(_EVENTS, start_dt, end_dt, sink_id=sink_id)
    return start_d, end_d, ev


def daily_series(events: Sequence[WasteEvent], start_d: date, end_d: date) -> List[DailyWaste]:
    by = aggregate_by_day(events)
    out: List[DailyWaste] = []
    d = start_d
    while d <= end_d:
        out.append(DailyWaste(day=d, volume_ml=round(by.get(d, 0.0), 1)))
        d += timedelta(days=1)
    return out


def recent_events_in_period(
    sink_id: str,
    start_d: date,
    end_d: date,
    limit: int = 50,
) -> List[WasteEvent]:
    _, _, start_dt, end_dt = period_bounds(start_d, end_d, default_days=30)
    mine = _events_in_range(_EVENTS, start_dt, end_dt, sink_id=sink_id)
    mine.sort(key=lambda x: x.at, reverse=True)
    return mine[:limit]
