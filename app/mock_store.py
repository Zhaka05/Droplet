"""In-memory mock readings. Replace with DB + real sensor ingestion later."""

from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, timedelta, timezone
from typing import Iterable, List, Sequence, Tuple
from uuid import uuid4

from app.schemas import DailyWaste, SinkBase, WasteEvent

UTC = timezone.utc


def _midnight_utc(d: date) -> datetime:
    return datetime(d.year, d.month, d.day, tzinfo=UTC)


def _build_mock_events() -> List[WasteEvent]:
    """Deterministic-ish mock: several sinks, usage spread over the last ~45 days."""
    sinks: List[Tuple[str, str, str | None]] = [
        ("kitchen-main", "Kitchen main", "Kitchen"),
        ("bath-up", "Upstairs bath", "Bathroom"),
        ("utility", "Utility sink", "Basement"),
    ]
    rng_seed = 42
    events: List[WasteEvent] = []
    today = date.today()
    start = today - timedelta(days=44)

    for day_offset in range(45):
        d = start + timedelta(days=day_offset)
        if day_offset % 7 == 0:
            rng_seed = (rng_seed * 1103515245 + 12345) & 0x7FFFFFFF
        for sink_id, _, _ in sinks:
            uses = 1 + (day_offset + hash(sink_id)) % 4
            for u in range(uses):
                rng_seed = (rng_seed * 1103515245 + 12345) & 0x7FFFFFFF
                hour = 7 + (rng_seed % 14)
                minute = rng_seed % 60
                second = (rng_seed // 60) % 60
                at = _midnight_utc(d).replace(hour=hour, minute=minute, second=second)
                ml = 80.0 + (rng_seed % 420) + (u * 17.0)
                events.append(
                    WasteEvent(
                        id=str(uuid4()),
                        sink_id=sink_id,
                        at=at,
                        volume_ml=round(ml, 1),
                    )
                )
    return events


_EVENTS: List[WasteEvent] = _build_mock_events()

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


def recent_events_for_sink(sink_id: str, limit: int = 50) -> List[WasteEvent]:
    mine = [e for e in _EVENTS if e.sink_id == sink_id]
    mine.sort(key=lambda x: x.at, reverse=True)
    return mine[:limit]
