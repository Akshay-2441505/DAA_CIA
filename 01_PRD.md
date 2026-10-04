# PowerSched — Product Requirements Document (PRD)

**Project:** PowerSched
**Academic title:** PowerSched: Energy-Aware Job Scheduling Using a Greedy Algorithm
**Course:** Design and Analysis of Algorithms (DAA)
**Project type:** Prototype Development
**Target build environment:** Antigravity
**Frontend:** React + Vite + TypeScript
**Backend:** Python + FastAPI

---

## 1. Product Overview

PowerSched is a small web application that demonstrates how a Greedy Algorithm can be applied to energy-aware computational job scheduling.

The user enters computational jobs with a duration, estimated power consumption, deadline, and priority. PowerSched obtains electricity market price signals in 15-minute blocks, identifies feasible execution windows, and schedules each job into a low-cost feasible window while respecting deadlines.

The prototype is intentionally designed as an academic DAA demonstration rather than a production workload orchestrator. It does not control a real computer, server, data centre, or electrical load.

### Core value proposition

> Schedule flexible computational work in cheaper electricity windows without missing deadlines.

---

## 2. Problem Statement

Many computational workloads are flexible in when they execute. Examples include data backups, report generation, batch analytics, rendering, and model training. A workload may finish at any point before a deadline, making it possible to shift execution away from expensive electricity-price periods.

A basic scheduler often runs jobs as soon as resources become available. This can ignore time-varying electricity market signals.

PowerSched addresses the algorithmic problem:

> Given a set of non-preemptive jobs and a sequence of 15-minute time slots with electricity-price signals, assign each job to a feasible contiguous time window before its deadline while attempting to reduce the estimated electricity cost using a Greedy scheduling strategy.

---

## 3. Goals

### Primary goals

1. Demonstrate a real-world application of a Greedy Algorithm.
2. Schedule jobs while respecting deadlines and resource availability.
3. Use live or recently published electricity market data when available.
4. Calculate estimated energy consumption and market-linked scheduling cost.
5. Compare PowerSched against a simple baseline scheduler.
6. Present the algorithm's result through a polished, understandable dashboard.

### Academic goals

1. Clearly define the problem, assumptions, input, output, and constraints.
2. Explain the Greedy strategy and why it is used.
3. Provide pseudocode and implementation details.
4. Analyze time and space complexity based on the actual implementation.
5. Demonstrate empirical results with repeatable test cases.

---

## 4. Non-Goals / Out of Scope

The V1 prototype will not:

- Automatically start or stop real workloads.
- Directly control CPUs, servers, Kubernetes, or cloud instances.
- Represent a user's actual household electricity bill.
- Claim that IEX market prices equal BESCOM consumer tariffs.
- Forecast future electricity prices using ML.
- Guarantee a globally optimal schedule for every scheduling instance.
- Implement distributed multi-machine scheduling.
- Implement job preemption.
- Include battery, solar, or demand-response hardware control.

These may appear in future-scope documentation but are not required for CIA3.

---

## 5. Target User

### Primary prototype user

A developer, student, operations analyst, or small-team technical user who has flexible computational workloads and wants to understand when those workloads could be scheduled more economically.

### Academic user

A faculty member or evaluator who needs to inspect the DAA logic, understand the algorithmic reasoning, and observe a functioning prototype.

---

## 6. Core User Journey

```text
Open PowerSched
      ↓
View current electricity market signal
      ↓
Add jobs
      ↓
Review job constraints
      ↓
Generate schedule
      ↓
Greedy algorithm assigns feasible low-cost windows
      ↓
Review timeline + cost
      ↓
Compare against baseline
```

---

## 7. V1 Features

### 7.1 Overview Dashboard

The dashboard provides a quick snapshot of the scheduling environment.

Required metrics:

- Current market price signal
- Cheapest upcoming slot
- Jobs scheduled
- Jobs unable to schedule
- Total energy required by scheduled jobs
- Estimated PowerSched cost
- Baseline cost
- Estimated savings
- Deadline compliance

### 7.2 Job Management

Users can create, edit, and delete jobs.

Required fields:

| Field | Type | Validation |
|---|---|---|
| Job name | String | Required, 1–80 characters |
| Duration | Integer | 15–1440 minutes; must be divisible by 15 |
| Power consumption | Number | Greater than 0 W |
| Deadline | Date/time or time-of-day | Required |
| Priority | Integer | 1–5; 5 = highest |

V1 assumes all jobs belong to one logical compute resource and therefore jobs do not overlap.

### 7.3 Electricity Price Data

The application supports a provider adapter for electricity market price data.

Primary V1 signal:

- IEX DAM or RTM market clearing price
- 15-minute delivery blocks
- Region: All India/national market signal

The system normalizes provider responses into a common internal format.

If live data cannot be retrieved, the application automatically falls back to cached/demo data.

### 7.4 Scheduler

The scheduler uses a deadline-first, cost-aware Greedy strategy.

For each job:

1. Jobs are ordered by earliest deadline.
2. Priority breaks deadline ties.
3. All feasible contiguous windows before the deadline are considered.
4. The cost of each window is calculated.
5. The cheapest feasible window is selected.
6. Selected slots are marked unavailable.
7. The scheduler continues until all jobs have been processed.

If no feasible window exists, the job is marked `UNSCHEDULED` with a human-readable reason.

### 7.5 Baseline Scheduler

A simple earliest-start / first-fit scheduler is used as the comparison baseline.

The baseline places each job into the earliest available contiguous window that can finish before its deadline.

### 7.6 Analytics

The application compares the two schedules using:

- Baseline estimated cost
- PowerSched estimated cost
- Estimated cost savings in INR
- Estimated cost savings percentage
- Deadline compliance
- Number of scheduled jobs
- Total energy required by scheduled jobs

Important: with fixed job power and duration and no overlapping execution, total energy is the same for a given set of scheduled jobs. The main optimization benefit in V1 is therefore **cost reduction through temporal shifting**, not lower physical energy consumption.

### 7.7 Schedule Timeline

A 24-hour horizontal timeline displays scheduled jobs against electricity-price blocks.

The timeline should visually communicate:

- Job start time
- Job end time
- Deadline
- Selected window
- Price level at the selected window

---

## 8. User Stories

### US1 — Add a job

As a user, I want to enter a job's duration, power, deadline, and priority so that the system can schedule it.

### US2 — View live pricing

As a user, I want to see the latest available electricity market price signal so that the schedule is based on current data when available.

### US3 — Generate schedule

As a user, I want PowerSched to generate a schedule automatically so that I do not need to compare every time slot manually.

### US4 — Understand the recommendation

As a user, I want to see why a job was placed in a particular time window so that the scheduling result is understandable.

### US5 — Compare scheduling strategies

As a user, I want to compare PowerSched with an earliest-start baseline so that I can see whether the Greedy approach reduced estimated cost.

### US6 — Handle infeasible jobs

As a user, I want the system to tell me when a job cannot be scheduled before its deadline and why.

---

## 9. Functional Requirements

### FR-01 — Create jobs

The system shall allow creation of jobs with valid name, duration, power, deadline, and priority.

### FR-02 — Validate job input

The system shall reject invalid durations, non-positive power values, missing deadlines, and invalid priorities.

### FR-03 — Fetch prices

The system shall retrieve price blocks through an abstracted price-provider service.

### FR-04 — Normalize prices

The system shall normalize external market-price responses into 15-minute time slots using a consistent timezone representation.

### FR-05 — Cache price data

The system shall persist the last successful price response so the prototype can continue functioning during a temporary API outage.

### FR-06 — Demo fallback

The system shall provide deterministic demo-price data for local development and demonstrations.

### FR-07 — Generate a greedy schedule

The system shall assign each schedulable job to a feasible low-cost window using the defined Greedy strategy.

### FR-08 — Prevent overlap

The system shall not assign two jobs to the same time block because V1 models a single compute resource.

### FR-09 — Enforce deadlines

The system shall not schedule a job in a window that finishes after its deadline.

### FR-10 — Calculate cost

The system shall calculate estimated cost from power consumption, duration, and normalized market-price signal.

### FR-11 — Generate baseline

The system shall create a baseline schedule using the earliest-start strategy.

### FR-12 — Compare schedules

The system shall calculate cost difference and percentage savings between baseline and PowerSched.

### FR-13 — Explain results

The system shall display the selected window, estimated cost, deadline, and a short explanation of why the window was selected.

---

## 10. Cost Calculation Model

For a job with constant power:

```text
Power (kW) = Power (W) / 1000
```

For a single execution period:

```text
Energy (kWh) = Power (kW) × Duration (hours)
```

For 15-minute slots with time-varying prices:

```text
Slot energy (kWh) = Power (kW) × 0.25
```

```text
Estimated cost (₹) = Σ [Slot energy (kWh) × Slot price (₹/kWh)]
```

IEX MCP is commonly published in ₹/MWh, so the normalized price is:

```text
Price (₹/kWh) = MCP (₹/MWh) / 1000
```

The UI shall label this result as an **estimated market-linked cost**, not as the user's actual electricity bill.

---

## 11. Success Criteria

The prototype is considered successful when:

1. A user can create at least 10 jobs without data corruption.
2. The system can retrieve or load 15-minute price blocks.
3. The scheduler creates a non-overlapping feasible schedule for valid test cases.
4. In cases where a cheaper feasible window exists, PowerSched produces a lower estimated cost than the earliest-start baseline.
5. The system correctly reports infeasible jobs.
6. Complexity claims in the CIA report match the implemented code.
7. The application remains usable when the external price API is unavailable.

---

## 12. Error States

The UI must gracefully handle:

- API unavailable
- API timeout
- Invalid API response
- No price data
- No feasible job window
- Invalid job fields
- Empty job list
- Schedule generation failure

Recommended user-facing messages should explain the issue without exposing raw backend stack traces.

---

## 13. Demo Dataset

The prototype shall ship with a deterministic demo dataset containing at least:

- 8–12 jobs
- 96 price blocks for a 24-hour horizon
- A mix of cheap and expensive time periods
- At least one flexible job that can clearly benefit from shifting
- At least one tight-deadline job
- At least one intentionally infeasible job for error demonstration

This ensures a reliable classroom demonstration even without live APIs.

---

## 14. Future Scope

Potential future extensions:

- Carbon-aware scheduling
- Multi-machine scheduling
- Cloud workload integration
- ML-based price forecasting
- Solar generation awareness
- Battery storage optimization
- Job preemption
- Multi-objective cost + carbon optimization
- Kubernetes workload integration
- Real workload execution controls

---

## 15. Academic Disclaimer

PowerSched is an educational prototype designed to demonstrate DAA concepts. Electricity market prices are used as an external optimization signal. They should not be interpreted as a user's actual retail electricity tariff, final billed electricity cost, or a guarantee of financial savings.
