# 💧 Droplet

A real-time water waste tracking app paired with a custom Arduino drain sensor. Droplet measures how much water goes down the drain during each use, tracks it against a daily limit, and alerts you when you've been running water too long.

---

## How It Works

A cylindrical sensor sits in the drain. Three conductivity probes are arranged in a triangle formation. When water bridges the probes, the circuit completes and the app starts tracking.

| Active Probes | Flow Level | Flow Rate |
|:---:|:---:|:---:|
| 1 | Low | 0.5 GPM |
| 2 | Medium | 1.5 GPM |
| 3 | High | 2.2 GPM |

After **60 seconds** of continuous flow, a buzzer fires on the hardware (pin D8) and the app shows a full-screen alert.

---

## Architecture

```
Arduino Uno
    │  USB Serial (JSON events)
    ▼
serial_bridge.py          ← Python — reads serial, POSTs to backend
    │  HTTP POST /api/sensor/event
    ▼
backend/main.py           ← FastAPI — receives events, broadcasts via WebSocket
    │  WebSocket ws://localhost:8000/ws
    ▼
React App (Vite)          ← UI — live updates, session history, daily limit
```

---

## Project Structure

```
Droplet/
├── backend/
│   ├── main.py              # FastAPI server — REST + WebSocket
│   └── requirements.txt     # Python dependencies
│
├── src/
│   ├── main.jsx             # React entry point
│   ├── App.jsx              # Root — context providers, routing, clock
│   ├── index.css            # Global styles
│   │
│   ├── store/
│   │   └── useSensorStore.js  # WebSocket state management + local simulation
│   │
│   ├── components/
│   │   ├── NavBar.jsx       # Bottom navigation bar
│   │   ├── WaterFill.jsx    # Animated circular water fill graphic
│   │   ├── BuzzerAlert.jsx  # Full-screen 60s warning overlay
│   │   └── Icons.jsx        # SVG icon components
│   │
│   └── pages/
│       ├── HomePage.jsx     # Live session card, daily total, recent sessions
│       ├── GoalsPage.jsx    # Daily limit setting with preset templates
│       ├── DevicesPage.jsx  # Sensor management, probe visualizer, simulator
│       └── ProfilePage.jsx  # User profile, stats, settings
│
├── serial_bridge.py         # Python — Arduino → backend bridge
├── index.html               # HTML shell
├── vite.config.js           # Vite + React plugin config
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.10+
- Arduino Uno with the Droplet sensor sketch uploaded

---

### 1. Install dependencies

**React app:**
```bash
npm install
```

**Backend:**
```bash
cd backend
pip install -r requirements.txt
```

**Serial bridge:**
```bash
pip install requests pyserial
```

---

### 2. Find your Arduino port

```bash
python -m serial.tools.list_ports --verbose
```

Look for `Arduino Uno (COMx)` and note the port. Update line 12 of `serial_bridge.py`:

```python
SERIAL_PORT = "COM4"   # your port here
```

---

### 3. Run everything

Open **four terminals**, each in the project root:

```bash
# Terminal 1 — React app
npm run dev

# Terminal 2 — Backend
cd backend
python -m uvicorn main:app --reload

# Terminal 3 — Serial bridge (Arduino must be connected)
python serial_bridge.py

# Terminal 4 — open the app
# Visit http://localhost:5173
```

---

## App Pages

### Home
Live total household waste for the day, daily limit progress with an animated water fill graphic, and a recent sessions log with time, duration, flow level, and gallons.

### Limit
Set a custom daily water waste limit in gallons. Choose from preset templates (Eco Warrior, Family of 4, Short Showers, etc.) or enter your own value. Progress bar turns orange at 80% and red when exceeded.

### Devices
View all connected sensors with live/connecting status. The probe configuration panel shows the triangle layout and lights up probes in real time. When the real sensor is disconnected, a built-in simulator lets you test all flow levels. Add new devices or edit/delete existing ones.

### Profile
Edit your name and avatar. View lifetime stats — total sessions, gallons wasted, average per session, and longest session. Manage notification preferences.

---

## Arduino Serial Protocol

The Arduino sends newline-delimited JSON over serial at 9600 baud:

```json
{ "event": "start" }
{ "event": "update", "duration_seconds": 5, "probes_active": 2, "flow_level": "medium", "flow_rate_gpm": 1.5, "gallons": 0.125 }
{ "event": "stop",   "duration_seconds": 12, "probes_active": 0, "flow_level": "none",   "flow_rate_gpm": 0.0, "gallons": 0.244 }
```

---

## Hardware

| Component | Purpose |
|---|---|
| Arduino Uno | Microcontroller |
| 3× Conductivity probe pairs | Water detection |
| 3× 1 MΩ resistors | Pull-up per probe |
| 3× 100 nF capacitors | Debounce per probe |
| Piezo buzzer | 60s waste alert |
| 2N2222 transistor | Buzzer driver |
| 1 kΩ resistor | Transistor base |

**Pinout:** A0 → Probe 1 · A1 → Probe 2 · A2 → Probe 3 · D8 → Buzzer (via Q1)

---

## Sensor Models

| Model | Probes | Formation |
|---|---|---|
| Uno | 1 | Single |
| Dos | 2 | Linear |
| Tres | 3 | Triangle |
