# PowerSched — Antigravity Build Brief

Use the three project documents in `docs/` as the source of truth:

- `01_PRD.md`
- `02_TECHNICAL_DESIGN.md`
- `03_DESIGN_SPEC.md`

## Build objective

Build a working full-stack academic prototype called **PowerSched**.

The app demonstrates a **deadline-first, cost-aware Greedy Algorithm** for scheduling non-preemptive computational jobs into 15-minute electricity-price windows.

## Non-negotiable technical constraints

- Frontend: React + Vite + TypeScript.
- Backend: Python + FastAPI.
- Database: SQLite.
- Algorithm must live in a standalone backend module and must not depend on UI/API code.
- External electricity data must be behind a provider interface.
- Use India Energy Atlas's documented IEX market endpoint as the primary live-provider adapter when credentials are available.
- Direct IEX member APIs are not assumed to be available to the student.
- Always provide cached/demo fallback.
- Never expose API keys in React.
- Never label cached/demo data as LIVE.
- Do not claim IEX market price equals a retail BESCOM tariff.
- Do not claim the Greedy strategy is globally optimal for all instances.

## Build order

### Phase 1

Create the repository structure and install dependencies.

### Phase 2

Implement SQLite models and CRUD job APIs.

### Phase 3

Implement price-provider interface, demo provider, cache, and live India Energy Atlas provider.

### Phase 4

Implement and unit-test the Greedy scheduler independently.

### Phase 5

Implement baseline scheduler and analytics.

### Phase 6

Connect FastAPI endpoints.

### Phase 7

Build the React shell and Overview page.

### Phase 8

Build Jobs page and Add Job modal.

### Phase 9

Build Scheduler page with price chart and 24-hour timeline.

### Phase 10

Build Insights page with algorithm explanation and baseline comparison.

### Phase 11

Add loading, error, cached/demo badges, validation, responsive behavior, and accessibility.

### Phase 12

Run full test suite and provide exact run commands.

## Required first-run demo

On a clean checkout, the app must be able to run using demo data without requiring an API key.

## Required demo content

Seed or expose a button for a deterministic demo scenario containing:

- ML Training
- Database Backup
- Report Generation
- Data Sync
- Video Rendering
- Analytics Batch
- Notification Batch
- One infeasible example

Use realistic but clearly synthetic values.

## Required output

The final application must show:

- Current price signal and source.
- Price curve.
- Jobs.
- Generated schedule.
- Cost.
- Baseline cost.
- Estimated savings.
- Deadline compliance.
- Why selected windows were chosen.
- Whether price data is LIVE, CACHED, or DEMO.

## Quality bar

The result should look like a premium dark energy-tech SaaS dashboard inspired by the provided visual reference. Do not build a generic academic admin panel.

The interface should be visually polished, but every number should be backed by actual calculations.
