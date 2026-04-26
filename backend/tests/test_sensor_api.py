import main


def test_get_sensor_state_is_default(client, default_state) -> None:
    response = client.get("/api/sensor/state")
    assert response.status_code == 200
    assert response.json() == default_state


def test_post_sensor_event_then_get_reflects_update(client) -> None:
    payload = {
        "event_type": "RUN",
        "probes_active": 1,
        "flow_level": "med",
        "flow_rate_gpm": 2.5,
        "gallons": 12.0,
        "duration_seconds": 30,
    }
    post = client.post("/api/sensor/event", json=payload)
    assert post.status_code == 200
    assert post.json() == {"ok": True}

    get = client.get("/api/sensor/state")
    assert get.status_code == 200
    assert get.json() == payload
    # Module-level state should match
    assert main.current_state == payload


def test_websocket_first_message_is_current_state(client, default_state) -> None:
    with client.websocket_connect("/ws") as ws:
        first = ws.receive_json()
        assert first == default_state
