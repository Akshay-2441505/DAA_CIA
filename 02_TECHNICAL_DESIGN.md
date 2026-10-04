# PowerSched — Technical Design Document

## 1. Purpose

This document defines the technical architecture, data model, APIs, scheduling algorithm, external-data integration, complexity assumptions, and implementation structure for PowerSched.

The design is optimized for a small but credible academic prototype that can be developed in Antigravity and demonstrated locally or through a simple deployment.

---

## 2. Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React | UI |
| Build tool | Vite | Fast development/build pipeline |
| Frontend language | TypeScript | Type safety |
| Styling | Tailwind CSS | Rapid consistent UI implementation |
| Charts | Recharts | Price and analytics charts |
| Icons | Lucide React | Consistent interface icons |
| Forms | React Hook Form | Form state + validation |
| Backend | Python | Algorithm and services |
| API framework | FastAPI | REST API |
| Validation | Pydantic | Request/response models |
| Database | SQLite | Lightweight persistence |
| HTTP client | httpx | External API requests |
| Testing | Pytest + frontend unit tests | Automated tests |
| Version control | Git/GitHub | Source management |
| Development agent | Antigravity | Build orchestration and coding |

No authentication is required for V1.

---

## 3. High-Level Architecture

```text
                     ┌───────────────────────────┐
                     │       React + Vite         │
                     │     PowerSched Frontend    │
                     └─────────────┬─────────────┘
                                   │ REST / JSON
                                   ▼
                     ┌───────────────────────────┐
                     │         FastAPI            │
                     │      API / Controllers     │
                     └─────────────┬─────────────┘
                                   │
              ┌────────────────────┼─────────────────────┐
              │                    │                     │
              ▼                    ▼                     ▼
      ┌───────────────┐   ┌────────────────┐   ┌─────────────────┐
      │ Job Service   │   │ Price Service  │   │ Schedule Service│
      └───────┬───────┘   └───────┬────────┘   └────────┬────────┘
              │                   │                      │
              ▼                   ▼                      ▼
        ┌──────────┐       ┌───────────────┐     ┌────────────────┐
        │ SQLite   │       │ Price Adapter │     │ Greedy Engine  │
        └──────────┘       └───────┬───────┘     └────────────────┘
                                   │
                     ┌─────────────┴──────────────┐
                     │                            │
              Live price source              Cache/demo
              (IEX-derived)                   dataset
```

---

## 4. Architectural Principles

### 4.1 Separate algorithm from application code

The Greedy algorithm shall not depend on FastAPI, React, database code, or external APIs.

### 4.2 External data behind an adapter

The scheduler consumes normalized `TimeSlot` objects, not raw third-party JSON.

### 4.3 Failure-tolerant external data

Live API failures must not prevent a classroom demo.

### 4.4 Reproducible algorithmic results

The demo dataset and deterministic scheduling rules must produce stable results.

### 4.5 Accurate claims

The application shall distinguish electricity-market price signals from retail consumer tariffs.

---

## 5. Project Structure

```text
powersched/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MetricCard.tsx
│   │   │   ├── StatusBadge.tsx
│   │   │   ├── PriceChart.tsx
│   │   │   ├── ScheduleTimeline.tsx
│   │   │   ├── JobCard.tsx
│   │   │   └── EmptyState.tsx
│   │   ├── pages/
│   │   │   ├── Overview.tsx
│   │   │   ├── Jobs.tsx
│   │   │   ├── Scheduler.tsx
│   │   │   └── Insights.tsx
│   │   ├── services/
│   │   │   └── api.ts
│   │   ├── hooks/
│   │   ├── types/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── app/
│   │   ├── main.py
│   │   ├── api/
│   │   │   ├── jobs.py
│   │   │   ├── prices.py
│   │   │   ├── schedules.py
│   │   │   └── analytics.py
│   │   ├── algorithms/
│   │   │   └── greedy_scheduler.py
│   │   ├── services/
│   │   │   ├── job_service.py
│   │   │   ├── price_service.py
│   │   │   ├── schedule_service.py
│   │   │   └── analytics_service.py
│   │   ├── providers/
│   │   │   ├── base.py
│   │   │   ├── india_energy_atlas.py
│   │   │   └── demo_provider.py
│   │   ├── models/
│   │   │   ├── job.py
│   │   │   ├── price_slot.py
│   │   │   └── schedule.py
│   │   └── database/
│   │       ├── database.py
│   │       └── repositories.py
│   ├── tests/
│   │   ├── test_greedy_scheduler.py
│   │   ├── test_price_service.py
│   │   └── test_api.py
│   └── requirements.txt
│
├── data/
│   └── demo_prices.json
├── docs/
│   ├── PRD.md
│   ├── TECHNICAL_DESIGN.md
│   └── DESIGN_SPEC.md
├── .env.example
├── .gitignore
└── README.md
```

---

## 6. Core Domain Model

### Job

```python
Job:
    id: int
    name: str
    duration_minutes: int
    power_watts: float
    deadline: datetime
    priority: int
```

### PriceSlot

```python
PriceSlot:
    index: int
    start_time: datetime
    end_time: datetime
    price_rs_mwh: float
    price_rs_kwh: float
    source: str
```

### ScheduledJob

```python
ScheduledJob:
    job_id: int
    start_time: datetime
    end_time: datetime
    slot_indexes: list[int]
    energy_kwh: float
    estimated_cost_rs: float
    status: str
    reason: str | None
```

---

## 7. Database Schema

### jobs

```text
id                 INTEGER PRIMARY KEY
name               TEXT NOT NULL
duration_minutes   INTEGER NOT NULL
power_watts        REAL NOT NULL
deadline            TEXT NOT NULL
priority            INTEGER NOT NULL
created_at          TEXT NOT NULL
updated_at          TEXT NOT NULL
```

### price_slots

```text
id                 INTEGER PRIMARY KEY
delivery_date      TEXT NOT NULL
start_time         TEXT NOT NULL
end_time           TEXT NOT NULL
price_rs_mwh       REAL NOT NULL
price_rs_kwh       REAL NOT NULL
source             TEXT NOT NULL
fetched_at         TEXT NOT NULL
```

### schedules

```text
id                 INTEGER PRIMARY KEY
job_id             INTEGER NOT NULL
start_time         TEXT NOT NULL
end_time           TEXT NOT NULL
energy_kwh         REAL NOT NULL
estimated_cost_rs  REAL NOT NULL
status             TEXT NOT NULL
reason             TEXT
created_at         TEXT NOT NULL
FOREIGN KEY(job_id) REFERENCES jobs(id)
```

SQLite is sufficient because this is a single-user academic prototype.

---

## 8. Electricity Data Integration

### 8.1 Primary provider for V1

Use an adapter around the **India Energy Atlas developer API** as the first implementation path because its current developer documentation exposes IEX DAM and RTM market endpoints and a free plan/key path.

Relevant current endpoint pattern:

```text
GET /developer/v1/market/iex/latest?market_type=DAM&limit=96
```

or:

```text
GET /developer/v1/market/iex/latest?market_type=RTM&limit=96
```

Requests use an `X-API-Key` header.

The provider currently documents 15-minute IEX blocks and returns MCP in ₹/MWh, with UTC timestamps that map to IEX 15-minute IST delivery blocks.

### 8.2 Direct IEX API

IEX's official technology page states that APIs are available to IEX members for iDAM and RTM. Therefore the prototype shall not assume that direct IEX member API credentials are freely available to a student.

The application architecture must keep the provider interchangeable.

### 8.3 Normalization

Every provider response must be normalized to:

```text
start_time
end_time
price_rs_mwh
price_rs_kwh
source
```

Price conversion:

```text
price_rs_kwh = price_rs_mwh / 1000
```

### 8.4 Timezone

Internally store timestamps as timezone-aware UTC values.

Render user-facing times in:

```text
Asia/Kolkata
```

The scheduler itself should operate on ordered normalized slots rather than relying on local clock arithmetic.

### 8.5 Cache/fallback strategy

```text
Live API
   ↓
Success? ── Yes → Normalize → Store cache → Use data
   │
   No
   ↓
Cached data available?
   │
   Yes → Use cached data
   │
   No
   ↓
Demo provider
```

The UI must indicate the active source:

```text
LIVE
CACHED
DEMO
```

Do not silently label cached/demo information as live.

---

## 9. Greedy Scheduling Algorithm

### 9.1 Assumptions

V1 assumes:

1. Jobs are non-preemptive.
2. Each job has a single power-consumption estimate.
3. Jobs run on one logical compute resource.
4. Two jobs cannot overlap.
5. Each job duration is divisible by 15 minutes.
6. A job must finish no later than its deadline.
7. The price signal is constant within each 15-minute slot.
8. The scheduling horizon is 24 hours for the main demonstration.

### 9.2 Greedy rule

**Primary rule:** earliest deadline first.

**Tie-break:** higher priority first.

**Window selection:** cheapest feasible contiguous time window.

This is a heuristic greedy strategy, not a proof of global optimality for all scheduling formulations.

### 9.3 Pseudocode

```text
GREEDY_SCHEDULE(jobs, slots):

    sort jobs by:
        1. ascending deadline
        2. descending priority

    mark all slots as available
    scheduled = []
    unscheduled = []

    for each job in sorted jobs:

        required_slots = job.duration_minutes / 15
        feasible_windows = []

        for each possible start index:
            window = next required_slots consecutive slots

            if window exceeds horizon:
                continue

            if window ends after job.deadline:
                continue

            if any slot in window is occupied:
                continue

            window_price = sum(slot.price_rs_kwh for slot in window)
            window_energy = (job.power_watts / 1000) * 0.25 * required_slots
            window_cost = (job.power_watts / 1000) * 0.25 * window_price

            add (window, window_cost) to feasible_windows

        if feasible_windows is empty:
            add job to unscheduled with reason
            continue

        choose feasible window with minimum window_cost

        mark selected slots occupied
        create ScheduledJob
        add to scheduled

    return scheduled, unscheduled
```

### 9.4 Why the greedy choice is meaningful

For each job, among the currently feasible windows, the scheduler chooses the least-cost window while the job order prioritizes deadline feasibility.

The design therefore combines two greedy decisions:

```text
Job ordering: earliest deadline first
Window choice: cheapest feasible window
```

This is straightforward to demonstrate and explain in the viva.

---

## 10. Baseline Algorithm

The baseline intentionally avoids price optimization.

```text
BASELINE_SCHEDULE(jobs, slots):

    sort jobs by earliest deadline

    for each job:
        find earliest available contiguous window
        that finishes before its deadline
        assign job to that window
```

This gives us a clear experimental comparison:

```text
Baseline → schedules as early as possible
PowerSched → schedules in the cheapest feasible window
```

---

## 11. Complexity Analysis

Let:

```text
J = number of jobs
T = number of 15-minute slots
```

Sorting jobs costs:

```text
O(J log J)
```

The straightforward implementation examines candidate start positions and checks each window. If window costs are calculated using prefix sums, the cost of a candidate window can be obtained in O(1), while feasibility still requires checking slot occupancy unless occupancy is represented through a suitable structure.

For the planned simple V1 implementation with a slot array and direct occupancy checks, the worst-case scheduling cost is conservatively represented as:

```text
O(J log J + J × T × W)
```

where `W` is the maximum number of slots required by one job.

Because the main demo uses a fixed 96-slot daily horizon, this is effectively manageable for the prototype.

If the implementation uses a separate efficient occupancy/prefix-sum structure that reduces window checking, the documented complexity must be updated to match that exact code.

### Space complexity

```text
O(J + T)
```

excluding database and HTTP-client overhead.

### Documentation rule

The final CIA report must state complexity based on the **final source code**, not merely this design document.

---

## 12. Cost and Energy Calculation

For constant power:

```text
power_kw = power_watts / 1000
slot_hours = 0.25
slot_energy_kwh = power_kw × slot_hours
```

For each selected slot:

```text
slot_cost_rs = slot_energy_kwh × price_rs_kwh
```

Total job cost:

```text
job_cost_rs = Σ slot_cost_rs
```

Total schedule cost:

```text
schedule_cost_rs = Σ job_cost_rs
```

Savings:

```text
savings_rs = baseline_cost_rs - powersched_cost_rs
```

```text
savings_percent = (savings_rs / baseline_cost_rs) × 100
```

Only display a percentage when baseline cost is greater than zero.

---

## 13. API Specification

### Jobs

```http
GET    /api/jobs
POST   /api/jobs
GET    /api/jobs/{id}
PUT    /api/jobs/{id}
DELETE /api/jobs/{id}
```

### Prices

```http
GET /api/prices/current
GET /api/prices/today
POST /api/prices/refresh
```

### Schedule

```http
POST /api/schedules/generate
GET  /api/schedules/latest
GET  /api/schedules/{id}
```

### Analytics

```http
GET /api/analytics/summary
GET /api/analytics/comparison
```

### Health

```http
GET /api/health
```

---

## 14. Example API Payloads

### Create Job

```json
{
  "name": "ML Training",
  "duration_minutes": 240,
  "power_watts": 800,
  "deadline": "2026-10-05T06:00:00+05:30",
  "priority": 5
}
```

### Generate Schedule

```json
{
  "horizon_start": "2026-10-05T00:00:00+05:30",
  "horizon_end": "2026-10-05T23:59:59+05:30",
  "mode": "greedy"
}
```

### Schedule response

```json
{
  "schedule_id": 12,
  "status": "completed",
  "scheduled_jobs": [
    {
      "job_id": 1,
      "start_time": "2026-10-05T02:15:00+05:30",
      "end_time": "2026-10-05T06:15:00+05:30",
      "energy_kwh": 3.2,
      "estimated_cost_rs": 18.72,
      "status": "scheduled",
      "reason": "Cheapest feasible contiguous window before deadline"
    }
  ]
}
```

---

## 15. Frontend State Model

Core state:

```text
jobs
priceSlots
currentPrice
latestSchedule
baselineSchedule
analytics
priceSource
loading
errors
```

API calls should be isolated in `services/api.ts` rather than embedded in page components.

---

## 16. UI-to-API Mapping

| Screen | API |
|---|---|
| Overview | `/api/prices/current`, `/api/analytics/summary` |
| Jobs | `/api/jobs` |
| Scheduler | `/api/prices/today`, `/api/schedules/generate` |
| Insights | `/api/analytics/comparison`, `/api/schedules/latest` |

---

## 17. Error Handling

Backend error responses should use a predictable JSON structure:

```json
{
  "error": {
    "code": "PRICE_PROVIDER_UNAVAILABLE",
    "message": "Live market data is temporarily unavailable.",
    "fallback_available": true
  }
}
```

Frontend should convert technical errors into understandable messages.

---

## 18. Testing Strategy

### Algorithm tests

1. One job with one obvious cheapest window.
2. Multiple jobs with overlapping candidate windows.
3. Tight deadline.
4. Impossible job.
5. Same deadline, different priorities.
6. Same cost in multiple windows.
7. Long job spanning multiple slots.
8. All slots occupied.

### Provider tests

1. Valid live response.
2. Missing price field.
3. Invalid timestamp.
4. Timeout.
5. HTTP 4xx/5xx.
6. Empty data response.
7. Cache fallback.
8. Demo fallback.

### API tests

Test CRUD, validation, scheduling, and analytics endpoints.

### UI tests

Verify:

- Job validation messages.
- Loading states.
- Schedule rendering.
- API source badge.
- Empty states.
- Error states.

---

## 19. Security and Configuration

External API keys must never be stored in frontend source code.

Use environment variables:

```text
ATLAS_API_KEY=
PRICE_PROVIDER=atlas
```

The frontend should only call our backend.

`.env` must be ignored by Git.

Provide `.env.example` without real credentials.

---

## 20. Deployment

Recommended academic deployment:

```text
Frontend → Vercel / static hosting
Backend  → Render or equivalent Python host
Database → SQLite for demo/single-instance deployment
```

For the classroom, local execution is the primary requirement.

---

## 21. Observability

Minimal structured logging should record:

- API price fetch time
- Provider name
- Number of received blocks
- Fallback activation
- Schedule generation duration
- Number of scheduled/unscheduled jobs

Never log API keys.

---

## 22. Data Source Notes

The official IEX site currently exposes DAM and RTM market snapshots in 15-minute blocks and publishes MCP in ₹/MWh. IEX also states that APIs for iDAM and RTM are available to members.

India Energy Atlas currently documents versioned developer endpoints for IEX DAM and RTM, including a free-plan API-key path for latest 15-minute blocks. Because external endpoint availability and terms can change, the application must isolate the provider in a dedicated adapter and retain the demo-data fallback.

The final implementation should verify the provider contract immediately before integration rather than hard-coding undocumented paths.

---

## 23. Technical Acceptance Criteria

The technical implementation is accepted when:

- `frontend/` builds successfully with Vite.
- `backend/` starts successfully with FastAPI.
- The frontend can create and list jobs through the backend.
- Price data can be loaded from live/cache/demo mode.
- Greedy scheduling is independently unit-tested.
- Baseline and PowerSched schedules are generated from the same job/price inputs.
- Analytics values match backend calculations.
- No API keys are exposed to the browser.
- The final complexity analysis is verified against the final implementation.
