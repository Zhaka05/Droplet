import copy

import pytest
from starlette.testclient import TestClient

import main

# Keep in sync with main.current_state’s initial value.
_DEFAULT_STATE: dict = {
    "event_type": "IDLE",
    "probes_active": 0,
    "flow_level": "none",
    "flow_rate_gpm": 0.0,
    "gallons": 0.0,
    "duration_seconds": 0,
}


@pytest.fixture
def default_state() -> dict:
    return copy.deepcopy(_DEFAULT_STATE)


@pytest.fixture
def client(default_state: dict) -> TestClient:
    with TestClient(main.app) as c:
        yield c


@pytest.fixture(autouse=True)
def reset_state(default_state: dict) -> None:
    """So tests don’t depend on order or prior mutations of main.current_state."""
    main.current_state = copy.deepcopy(default_state)
    main.manager.active.clear()
    yield
    main.current_state = copy.deepcopy(default_state)
    main.manager.active.clear()
