# Droplet Frontend

A mobile-responsive web app for tracking water waste.

## Setup

1. Make sure the backend is running on `http://localhost:8000` (or update `API_BASE` in `app.js` if different).

2. To serve the frontend, you can use a simple HTTP server:

   - Using Python: `python -m http.server 3000` (then visit `http://localhost:3000`)

   - Using Node.js: Install `http-server` globally and run `http-server -p 3000`

   - Or open `index.html` directly in a browser (but API calls may be blocked due to CORS).

## Features

- **Home Page**: Shows overall water waste over the last 30 days with a simple bar chart.

- **Sinks Page**: Lists all sinks with their total waste in the period.

- **Sink Detail Page**: Shows detailed waste data for a specific sink, including daily breakdown and recent events.

The app is designed to be mobile-responsive and works well on phones and tablets.