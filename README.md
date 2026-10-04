# PowerSched: Energy-Aware Job Scheduling Using a Greedy Algorithm

> **Academic Coursework:** Design and Analysis of Algorithms (DAA — CIA 3)  
> **Target Problem:** Non-Preemptive Computational Job Scheduling with Variable Electricity Market Price Signals  
> **Core Algorithm:** Deadline-First, Cost-Aware Greedy Strategy  
> **Comparison Baseline:** Earliest-Start / First-Fit Scheduler  
> **Price Signal:** Indian Energy Exchange (IEX) Day-Ahead Market (DAM) 15-Minute Clearing Prices  

---

## 1. Project Overview

**PowerSched** is a full-stack academic demonstration that proves how temporal shifting of flexible computational workloads (e.g., machine learning training, database backups, batch report rendering) into low-cost electricity windows achieves significant cost reductions without violating completion deadlines.

### Core Value Proposition
```text
Schedule flexible computational work in cheaper electricity windows without missing deadlines.
```

---

## 2. DAA Algorithmic Formulation

### 2.1 Problem Definition
- **Jobs**: A set of $J$ non-preemptive workloads $J_i = (d_i, p_i, D_i, \pi_i)$, where:
  - $d_i$: duration in minutes (constrained to multiples of 15 min).
  - $p_i$: estimated average power consumption in Watts ($W$).
  - $D_i$: hard completion deadline.
  - $\pi_i$: scheduling priority ($1 \le \pi_i \le 5$, with 5 being highest).
- **Compute Resource**: Single logical compute node (no two workloads execute concurrently; mutual exclusion).
- **Time Horizon**: Discretized into $T = 96$ contiguous 15-minute slots over 24 hours, each with market clearing price $P_t$ in ₹/kWh.
- **Cost Function**: For a contiguous execution window $W$ consisting of $w_i = d_i / 15$ slots:
  $$\text{Energy per slot (kWh)} = \frac{p_i}{1000} \times 0.25$$
  $$\text{Cost}(W) = \frac{p_i}{1000} \times 0.25 \times \sum_{t \in W} P_t$$

### 2.2 Greedy Scheduling Strategy
1. **Global Ordering**: Sort all jobs by **Earliest Deadline First (EDF)** ascending. Break deadline ties by **Priority descending** ($\pi_i$).
2. **Feasible Window Search**: For each sorted job, scan all candidate starting slot indices $s \in [0, T - w_i]$:
   - *Constraint 1 (Deadline)*: Slot end time of $s + w_i - 1 \le D_i$.
   - *Constraint 2 (Collision)*: All slots in $[s, s + w_i - 1]$ must be unoccupied.
3. **Greedy Choice**: Using precomputed prefix sums of slot prices, evaluate $\text{Cost}(W)$ in $O(1)$. Select the feasible window yielding the **minimum estimated electricity cost**.
4. **Lock & Commit**: Mark the selected slots as occupied and record the algorithmic rationale.
5. **Infeasibility Handling**: If no feasible window exists before the deadline, mark the job as `UNSCHEDULED` with detailed diagnostic reasons.

### 2.3 Baseline Scheduler (Experimental Control)
- Uses an **Earliest-Start / First-Fit** strategy: schedules each job in the very first available contiguous window finishing before its deadline, completely ignoring electricity price dynamics.
- Quantifies empirical savings:
  $$\text{Savings (₹)} = \text{Cost}_{\text{Baseline}} - \text{Cost}_{\text{PowerSched}}$$
  $$\text{Savings (\%)} = \left(\frac{\text{Savings (₹)}}{\text{Cost}_{\text{Baseline}}}\right) \times 100$$

### 2.4 Asymptotic Complexity Analysis
- **Sorting Phase**: $O(J \log J)$ via Timsort.
- **Prefix Sum Table**: $O(T)$ one-time cumulative sum preprocessing.
- **Window Search Loop**: For each of the $J$ jobs, checks at most $T$ candidate start positions. Window price lookups are $O(1)$ via prefix sums, and occupancy checks take $O(w_i) \le O(T)$. Total search: $O(J \cdot T)$.
- **Total Time Complexity**: $\mathbf{O(J \log J + J \cdot T)}$. Given $T=96$ for a daily cycle, execution takes $< 5\text{ ms}$.
- **Space Complexity**: $\mathbf{O(J + T)}$ auxiliary space for slot occupancy bitmask and prefix sums.

---

## 3. Technology Stack & Architecture

- **Backend**: Python 3.13, FastAPI, SQLite (clean repository pattern), Pydantic v2, HTTPX, Pytest.
- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, Recharts, Lucide React, React Hook Form.
- **Price Provider Layer**: 3-tier fallback architecture:
  1. **Live Provider**: India Energy Atlas developer API (`GET /developer/v1/market/iex/latest?market_type=DAM`).
  2. **SQLite Cache**: Persisted previous successful fetches.
  3. **Deterministic Demo Provider**: 96 15-minute synthetic price blocks modeling authentic Indian market peak/off-peak curves.
  - Transparent badges: `● LIVE`, `● CACHED`, `● DEMO`.

---

## 4. Quick Start & Execution Guide

### Prerequisites
- Python 3.10+ (tested on Python 3.13)
- Node.js v18+ and npm (tested on Node v22)

### 4.1 Backend Setup & Execution
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run automated tests (10 test suites covering Greedy algorithm and API endpoints)
python -m pytest tests

# Start FastAPI server
python -m app.main
```
The backend API will start on: **`http://localhost:8000`**  
Interactive Swagger API documentation: **`http://localhost:8000/docs`**

### 4.2 Frontend Setup & Execution
```bash
# In a new terminal, navigate to frontend directory
cd frontend

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```
The frontend UI will be accessible on: **`http://localhost:5173`**

---

## 5. Demonstration Benchmark Workloads

PowerSched ships with 8 deterministic benchmark workloads accessible via the **"Load Academic Demo Jobs"** button:
1. **ML Model Training** (240m, 800W, Deadline 08:00 AM, Priority 5) — Shifts to cheap overnight trough (02:00–06:00).
2. **Database Backup** (60m, 450W, Deadline 07:30 AM, Priority 4) — Overnight maintenance.
3. **Executive Report Generation** (45m, 350W, Deadline 10:00 AM, Priority 3).
4. **Cloud Storage Data Sync** (90m, 250W, Deadline 02:00 PM, Priority 3).
5. **4K Video Rendering** (120m, 1200W, Deadline 06:00 PM, Priority 4) — Shifts to afternoon solar dip.
6. **Daily Analytics Batch** (90m, 500W, Deadline 08:00 PM, Priority 2).
7. **Notification Dispatch Batch** (30m, 200W, Deadline 09:30 PM, Priority 1).
8. **Infeasible Express Archive** (120m, 600W, Deadline 01:00 AM, Priority 5) — Intentionally infeasible test case proving deadline validation and graceful failure diagnostics.

---

## 6. Academic Disclaimer

PowerSched is an educational prototype built for Design and Analysis of Algorithms (DAA). Electricity prices reflect wholesale market clearing signals (IEX) used as external optimization inputs, and should not be construed as retail residential consumer tariffs or actual power bills.
