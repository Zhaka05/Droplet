#!/usr/bin/env python3
"""
Bridge: Arduino (or any device) over **USB serial** → local Droplet API.

Typical setup
-------------
1. Run the API on the same computer the cable is plugged into::

     poetry run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

2. Install the optional serial dependency::

     poetry install --with bridge

3. Flash firmware to print **one line per sink use** on Serial (115200 baud is common).

4. Run this script (macOS/Linux example)::

     poetry run python scripts/serial_to_api.py --port /dev/tty.usbmodem1101

   Windows example::

     poetry run python scripts/serial_to_api.py --port COM3

Line format (choose one)
------------------------
**JSON** (matches ``POST /api/waste/events``)::

    {"sink_id":"kitchen-main","volume_ml":185.5}

**CSV** (shorthand; volume is milliliters)::

    kitchen-main,185.5

The API URL defaults to ``http://127.0.0.1:8000`` — correct for local-only / wired use.
"""

from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request
from typing import Any


def post_event(base: str, payload: dict[str, Any]) -> None:
    url = base.rstrip("/") + "/api/waste/events"
    body = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=10) as resp:
        resp.read()


def parse_line(line: str) -> dict[str, Any] | None:
    line = line.strip()
    if not line:
        return None
    if line.startswith("{"):
        return json.loads(line)
    if "," in line:
        sink_id, rest = line.split(",", 1)
        return {"sink_id": sink_id.strip(), "volume_ml": float(rest.strip())}
    return None


def main() -> int:
    p = argparse.ArgumentParser(description="Serial → Droplet POST /api/waste/events")
    p.add_argument("--port", required=True, help="Serial device, e.g. /dev/tty.usbmodem1101 or COM3")
    p.add_argument("--baud", type=int, default=115200)
    p.add_argument("--api-base", default="http://127.0.0.1:8000", help="Droplet root URL (local)")
    p.add_argument("--dry-run", action="store_true", help="Parse lines but do not POST")
    args = p.parse_args()

    try:
        import serial
    except ImportError:
        print("Install pyserial: poetry install --with bridge", file=sys.stderr)
        return 1

    ser = serial.Serial(args.port, args.baud, timeout=1)
    print(f"Listening on {args.port} @ {args.baud} → {args.api_base}/api/waste/events", flush=True)

    try:
        while True:
            raw = ser.readline()
            if not raw:
                continue
            try:
                text = raw.decode("utf-8", errors="replace")
            except Exception:
                continue
            try:
                payload = parse_line(text)
            except (json.JSONDecodeError, ValueError) as e:
                print(f"skip (parse): {text!r} — {e}", flush=True)
                continue
            if not payload:
                continue
            if args.dry_run:
                print(f"dry-run: {payload}", flush=True)
                continue
            try:
                post_event(args.api_base, payload)
                print(f"ok: {payload}", flush=True)
            except urllib.error.HTTPError as e:
                body = e.read().decode("utf-8", errors="replace")
                print(f"HTTP {e.code}: {body}", flush=True)
            except urllib.error.URLError as e:
                print(f"POST failed: {e}", flush=True)
    except KeyboardInterrupt:
        print("\nExiting.", flush=True)
    finally:
        ser.close()

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
