# PowerSched — UI / UX Design Specification

## 1. Design Reference

The provided reference image establishes the visual direction for PowerSched.

The reference communicates a premium energy-tech product through:

- Dark charcoal/navy surfaces
- Rounded elevated cards
- High-contrast white typography
- Bright lime/green emphasis for positive/active energy information
- Large numerical metrics
- Compact status pills
- Subtle borders and shadows
- Strong spacing and hierarchy
- Minimal visual noise
- A sophisticated dashboard feel rather than a traditional academic CRUD application

PowerSched should **take inspiration from this visual language without directly copying the reference layout or branding**.

---

## 2. Design Principle

> Complex scheduling data should feel calm, visual, and easy to understand.

The UI should make the user understand three questions quickly:

1. **What is happening with electricity prices?**
2. **When will my jobs run?**
3. **Why did PowerSched choose those times?**

---

## 3. Visual Direction

### Overall mood

Premium, dark, technical, quiet, modern.

Avoid the look of:

- A generic admin dashboard
- A university project template
- A spreadsheet-based scheduler
- A dense monitoring console

---

## 4. Color Tokens

### Background

```text
Page background: #0B0E13
```

### Surfaces

```text
Primary card: #171C25
Elevated card: #202633
Secondary surface: #262D39
```

### Text

```text
Primary: #F3F5F7
Secondary: #9AA2AE
Muted: #6E7684
```

### Accent

```text
Energy green: #9CFF72
```

Use the green accent sparingly for:

- Active states
- Live indicator
- Successful optimization
- Selected schedule
- Positive savings
- Key chart points

### Supporting states

```text
Warning: warm amber
Error: muted red
Info: cool neutral blue/grey
```

Do not turn the entire dashboard into a rainbow dashboard.

---

## 5. Typography

Preferred font:

**Inter**

Alternative:

**Manrope**

### Scale

```text
Page title:       32–40px / semibold
Section heading:  20–24px / semibold
Metric:           28–36px / medium or semibold
Body:             14–16px / regular
Metadata:         11–13px / medium
Button:           13–14px / medium
```

Numbers should have enough visual weight to be scanned instantly.

---

## 6. Spacing and Shape

Use a 4px/8px spacing system.

Recommended:

```text
Page padding: 28–40px
Card padding: 20–24px
Card radius: 18–24px
Button radius: 12–14px
Input radius: 12px
Pill radius: 999px
```

Borders should be subtle.

```text
border: 1px solid rgba(255,255,255,0.07)
```

Avoid excessive outlines.

---

## 7. Navigation

Desktop layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ PowerSched                               ● Live / IEX DAM    │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│ Overview     │              Main content                    │
│ Jobs         │                                              │
│ Scheduler    │                                              │
│ Insights     │                                              │
│              │                                              │
│ Settings     │                                              │
└──────────────┴──────────────────────────────────────────────┘
```

Sidebar:

- Compact
- Darker than main content area
- Simple line icons
- Active item receives subtle elevated background and green marker

Primary navigation items:

```text
Overview
Jobs
Scheduler
Insights
```

Settings can be secondary.

---

## 8. Global Header

Header elements:

Left:

```text
PowerSched
```

Right:

```text
● LIVE
IEX DAM
```

Optional refresh indicator:

```text
Updated 2 min ago
```

When using cached/demo data, the badge must change:

```text
● CACHED
● DEMO
```

Do not use “LIVE” when the app is running on cached/demo data.

---

## 9. Overview Screen

### Goal

Create an immediate snapshot of the scheduling system.

### Top row

Four metric cards:

```text
Current Price
₹5.31 / kWh signal
IEX DAM

Cheapest Window
02:15–04:15
₹3.84 / kWh

Today's Energy
12.8 kWh
6 jobs scheduled

Estimated Cost
₹48.20
↓ 24.5% vs baseline
```

Note: the price should be clearly described as a **market signal**, not a household tariff.

### Price section

Large card:

```text
Electricity Price
Today

[line chart]
```

The chart should show 15-minute price blocks, but avoid displaying all 96 x-axis labels.

Use fewer readable axis labels with tooltips for exact blocks.

### Schedule preview

Large card:

```text
Today's Schedule                      View scheduler →

00   02   04   06   08   10 ... 24
│         ███████ Job A
│                   ███ Job B
│                         █████ Job C
```

### Insight card

Show one high-value explanation:

> **PowerSched moved ML Training to a lower-cost window, saving an estimated ₹11.20 compared with the earliest-start schedule.**

---

## 10. Jobs Screen

### Header

```text
Jobs
Manage the workloads PowerSched can schedule.

[ + Add Job ]
```

### Job table/card hybrid

Recommended columns:

```text
Job
Duration
Power
Deadline
Priority
Status
```

On smaller widths, switch to compact cards.

### Status badges

```text
READY
SCHEDULED
UNSCHEDULED
```

Use green only for successful/selected states.

---

## 11. Add Job Modal

Fields:

```text
Job name
[ ML Training                         ]

Duration
[ 240 ] minutes

Power consumption
[ 800 ] W

Deadline
[ 06:00 ]

Priority
[ 5 — Highest                       ▼ ]

                         [Cancel] [Add Job]
```

Validation examples:

```text
Duration must be in 15-minute increments.
Power consumption must be greater than 0.
Priority must be between 1 and 5.
```

---

## 12. Scheduler Screen — PRIMARY SCREEN

This is the main demonstration screen and should receive the strongest visual treatment.

### Header

```text
Scheduler
Find lower-cost execution windows without breaking deadlines.

[ Generate Schedule ]
```

### Controls

```text
Market: IEX DAM        Horizon: Today        Strategy: Greedy
```

Keep controls compact.

### Price ribbon

A thin overview of price intensity:

```text
Low ───────────────────────── High
██████████░░░░░████████████░░░░
```

Green may indicate low-cost selected regions, while neutral shades show general price variation.

### Main timeline

```text
00    02    04    06    08    10    12    14    16    18    20    22    24
│     │     │     │     │     │     │     │     │     │     │     │
│            ███████████
│            ML Training
│                               ██████
│                               Backup
│                                                ███████
│                                                Report
```

Each job bar must display:

- Job name
- Start/end time
- Optional power

### Deadline markers

A small vertical marker or label should show the deadline.

If a job is unscheduled:

```text
UNSCHEDULED
No feasible window before 06:00.
```

---

## 13. Schedule Result Card

After schedule generation, show:

```text
Schedule optimized

6 / 7 jobs scheduled

Estimated Cost
₹48.20

Baseline
₹63.90

Savings
₹15.70  ↓ 24.6%
```

CTA:

```text
View why →
```

---

## 14. Insights Screen

Purpose:

Explain the algorithm's outcome in human terms.

### Insight card 1

```text
BEST WINDOW FOUND

ML Training
02:15–06:15

Market signal
₹3.84 / kWh

Why?
Cheapest feasible 4-hour window before the 06:00 deadline.
```

### Insight card 2

```text
DEADLINE CONSTRAINT

Database Backup

Could not use the cheapest overnight window because
those slots were already occupied.
```

### Comparison chart

```text
Baseline       ███████████████  ₹63.90
PowerSched     ███████████      ₹48.20
```

### Algorithm explanation

A concise panel:

```text
Greedy Strategy

1. Order jobs by earliest deadline.
2. Break ties using priority.
3. Find feasible windows.
4. Choose the cheapest window.
5. Mark the selected slots occupied.
```

This is useful in the DAA viva.

---

## 15. Loading States

Use skeleton loaders for:

- Metric cards
- Price chart
- Schedule timeline

Avoid spinner-only full-screen loading.

Example:

```text
████████
██████████████
```

---

## 16. Empty States

### No jobs

```text
No jobs yet
Add your first workload to generate a schedule.

[ + Add Job ]
```

### No schedule

```text
No schedule generated
Add jobs and run PowerSched to find lower-cost windows.

[ Generate Schedule ]
```

---

## 17. Error States

### Live API unavailable

```text
Live market data unavailable
Using the most recent cached data.
```

### No cache

```text
Live data unavailable
Using demo market data for this session.
```

### Infeasible job

```text
Cannot schedule this job
The requested duration does not fit before the deadline.
```

Errors should be calm, readable, and actionable.

---

## 18. Motion

Animation should be subtle.

Recommended:

- 150–250ms card hover transitions
- Chart draw animation on first load
- Schedule bars fade/slide into place after generation
- Metric values animate when schedule results update

Avoid:

- Excessive bouncing
- Flashing status indicators
- Long page transitions

---

## 19. Responsive Design

### Desktop

Primary target.

Minimum supported width:

```text
1280px
```

### Tablet

Collapse sidebar into compact navigation.

### Mobile

Use:

```text
Top bar
      ↓
Metric cards stacked
      ↓
Price chart
      ↓
Scrollable schedule timeline
      ↓
Job cards
```

The 24-hour timeline may scroll horizontally on mobile.

---

## 20. Accessibility

Required:

- Keyboard navigable controls
- Visible focus states
- Sufficient contrast
- Form labels
- Error messages associated with fields
- Icons must not be the only way to communicate status
- Screen-reader-friendly button labels

Do not rely solely on green/red distinctions for states.

---

## 21. Content and Terminology

Use these phrases:

```text
Electricity market price
Market price signal
Estimated cost
Estimated savings
Deadline
Scheduled
Unscheduled
Greedy strategy
```

Avoid these phrases unless technically implemented:

```text
Guaranteed savings
Your electricity bill
Optimized electricity consumption
AI-powered optimization
Real-time tariff
```

The prototype is algorithmic, not an AI product.

---

## 22. Key Microcopy

### Generate schedule button

**Generate Schedule**

### Successful result

**Schedule optimized**

### Live data

**Live market signal**

### Cached data

**Using cached market data**

### Demo data

**Demo market data**

### Main recommendation

**Best feasible window**

### Explanation

**Why this slot?**

---

## 23. Design-to-Implementation Rules for Antigravity

1. Do not create a generic Bootstrap/admin dashboard.
2. Do not use excessive cards for every small piece of information.
3. Use large dark surfaces and spacious layout.
4. Use green only for meaningful energy/optimization states.
5. Keep primary actions obvious.
6. The Scheduler page is the hero experience.
7. Price chart and schedule timeline should share a visually understandable time axis where practical.
8. The user must be able to see the difference between live, cached, and demo data.
9. Avoid fake charts or decorative data.
10. All displayed metrics must originate from backend calculations or clearly marked demo data.
11. Never invent a savings percentage just for visual polish.
12. Keep the UI polished enough to look like a small energy-tech SaaS product while retaining the academic transparency of the algorithm.

---

## 24. Reference Mapping

The provided visual reference can be translated as follows:

| Reference concept | PowerSched equivalent |
|---|---|
| System Overview | Overview dashboard |
| Energy Flow | Schedule + price flow |
| Insights | Algorithm explanations + comparison |
| Large headline metrics | Price / Cost / Savings cards |
| Green energy highlight | Optimization / savings highlight |
| Status pill | LIVE / CACHED / DEMO |
| Dark premium background | PowerSched shell |
| Rounded cards | Metric and insight cards |
| Strong numeric hierarchy | Scheduling KPI cards |

The reference's visual spirit is retained while the information architecture is rebuilt around the scheduling problem.
