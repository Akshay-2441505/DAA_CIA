import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from app.database.database import init_db
from app.database.repositories import JobRepository
from app.services.job_service import JobService
from app.services.price_service import PriceService
from app.api.jobs import router as jobs_router
from app.api.prices import router as prices_router
from app.api.schedules import router as schedules_router
from app.api.analytics import router as analytics_router



@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    init_db()
    # Seed demo jobs if database is currently empty
    if JobRepository.count() == 0:
        JobService.seed_demo_jobs()
    # Preload demo/cached prices
    price_service = PriceService()
    await price_service.get_slots()
    yield


app = FastAPI(
    title="PowerSched API — Energy-Aware Computational Job Scheduler",
    description="Academic prototype demonstrating a Deadline-First, Cost-Aware Greedy Algorithm for DAA CIA-3.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS configuration
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in origins if o.strip()] or ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(jobs_router)
app.include_router(prices_router)
app.include_router(schedules_router)
app.include_router(analytics_router)


@app.get("/")
def root():
    return {
        "project": "PowerSched",
        "description": "Energy-Aware Job Scheduling Using a Greedy Algorithm (DAA CIA-3)",
        "docs_url": "/docs",
        "status": "online",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite",
        "job_count": JobRepository.count(),
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "127.0.0.1")
    uvicorn.run("app.main:app", host=host, port=port, reload=True)
