from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import waste

app = FastAPI(
    title="Droplet API",
    description="Water waste approximations per sink (mock data for now).",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(waste.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
