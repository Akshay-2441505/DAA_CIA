import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database.database import init_db


@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    init_db()


def test_health_endpoint():
    with TestClient(app) as client:
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"


def test_get_jobs():
    with TestClient(app) as client:
        response = client.get("/api/jobs")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 8  # Demo jobs seeded


def test_get_prices_today():
    with TestClient(app) as client:
        response = client.get("/api/prices/today")
        assert response.status_code == 200
        data = response.json()
        assert data["slot_count"] == 96
        assert "slots" in data
        assert len(data["slots"]) == 96


def test_generate_schedule():
    with TestClient(app) as client:
        response = client.post("/api/schedules/generate")
        assert response.status_code == 200
        data = response.json()
        assert "greedy" in data
        assert "baseline" in data
        assert "absolute_savings_rs" in data
        assert data["greedy"]["scheduled_count"] > 0


def test_analytics_summary():
    with TestClient(app) as client:
        response = client.get("/api/analytics/summary")
        assert response.status_code == 200
        data = response.json()
        assert "current_price_signal" in data
        assert "energy_metrics" in data
