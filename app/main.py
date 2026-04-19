from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles

from app.routers import waste

_ROOT = Path(__file__).resolve().parent.parent
_DIST = _ROOT / "frontend" / "dist"
_ASSETS = _DIST / "assets"

app = FastAPI(
    title="Droplet API",
    description="Water waste tracking: in-memory store + Arduino-friendly ingestion.",
    version="0.2.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if _ASSETS.is_dir():
    app.mount("/assets", StaticFiles(directory=str(_ASSETS)), name="assets")

app.include_router(waste.router)


@app.get("/")
def read_root():
    index = _DIST / "index.html"
    if not index.is_file():
        return HTMLResponse(
            content=(
                "<!DOCTYPE html><html><head><meta charset='utf-8'><title>Droplet</title></head>"
                "<body style='font-family:system-ui;padding:2rem;max-width:36rem'>"
                "<h1>UI not built yet</h1>"
                "<p>From the <code>frontend</code> folder run:</p>"
                "<pre style='background:#f4f4f5;padding:1rem;border-radius:8px'>npm install\nnpm run build</pre>"
                "<p>Then restart the API and open this page again. For local development, use "
                "<code>npm run dev</code> (Vite) together with uvicorn.</p>"
                "</body></html>"
            ),
            status_code=503,
        )
    return FileResponse(str(index))


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
