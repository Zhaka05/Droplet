import json
import time
import requests
import serial
import serial.tools.list_ports

# ── Serial port ───────────────────────────────────────────────────────────────
# Run this to list available ports and find your Arduino:
#   python -m serial.tools.list_ports --verbose
# It will show up as "USB Serial Device (COMx)" or "Arduino Uno (COMx)".
SERIAL_PORT = "COM4"   # Arduino Uno detected on COM4
BAUD_RATE = 9600

# ── Backend ───────────────────────────────────────────────────────────────────
BACKEND_URL = "http://127.0.0.1:8000/api/sensor/event"

USER_ID = "user_1"
SENSOR_ID = "sensor_bathroom_1"


def list_ports():
    ports = serial.tools.list_ports.comports()
    if ports:
        print("Available serial ports:")
        for p in ports:
            print(f"  {p.device} — {p.description}")
    else:
        print("No serial ports found.")


def post_event(payload):
    try:
        response = requests.post(BACKEND_URL, json=payload, timeout=5)
        print("POST", response.status_code, payload)
        try:
            print("RESPONSE:", response.json())
        except Exception:
            print("RESPONSE TEXT:", response.text)
    except Exception as e:
        print("POST FAILED:", e)


def normalize_event(raw):
    event = raw.get("event")

    if event == "start":
        return {
            "sensor_id": SENSOR_ID,
            "user_id": USER_ID,
            "event_type": "FLOW_STARTED",
        }

    if event == "update":
        return {
            "sensor_id": SENSOR_ID,
            "user_id": USER_ID,
            "event_type": "FLOW_UPDATE",
            "duration_seconds": raw.get("duration_seconds", 0),
            "probes_active": raw.get("probes_active", 0),
            "flow_level": raw.get("flow_level", "none"),
            "flow_rate_gpm": raw.get("flow_rate_gpm", 0.0),
            "gallons": raw.get("gallons", 0.0),
        }

    if event == "stop":
        return {
            "sensor_id": SENSOR_ID,
            "user_id": USER_ID,
            "event_type": "FLOW_STOPPED",
            "duration_seconds": raw.get("duration_seconds", 0),
            "probes_active": raw.get("probes_active", 0),
            "flow_level": raw.get("flow_level", "none"),
            "flow_rate_gpm": raw.get("flow_rate_gpm", 0.0),
            "gallons": raw.get("gallons", 0.0),
        }

    return None


def main():
    list_ports()
    print(f"\nConnecting to {SERIAL_PORT} at {BAUD_RATE} baud...")
    try:
        ser = serial.Serial(SERIAL_PORT, BAUD_RATE, timeout=1)
    except serial.SerialException as e:
        print(f"Could not open {SERIAL_PORT}: {e}")
        print("Check SERIAL_PORT above and rerun.")
        return

    time.sleep(2)  # Let Arduino reset after serial open
    print("Connected. Listening for Arduino events...\n")

    while True:
        try:
            line = ser.readline().decode("utf-8", errors="ignore").strip()
            if not line:
                continue
            print("SERIAL:", line)

            try:
                raw = json.loads(line)
            except json.JSONDecodeError:
                print("Skipping invalid JSON")
                continue

            payload = normalize_event(raw)
            if payload is not None:
                post_event(payload)
            else:
                print("Unknown event type, skipping")

        except KeyboardInterrupt:
            print("\nStopped by user.")
            break
        except Exception as e:
            print("ERROR:", e)
            time.sleep(1)


if __name__ == "__main__":
    main()
