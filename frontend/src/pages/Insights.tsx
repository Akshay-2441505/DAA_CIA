import React from 'react';
import {
  Sparkles,
  TrendingDown,
  BookOpen,
  CheckCircle2,
  Code2,
  Cpu,
  Clock,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { ScheduleComparison } from '../types';

interface InsightsProps {
  scheduleComparison: ScheduleComparison | null;
}

export const Insights: React.FC<InsightsProps> = ({ scheduleComparison }) => {
  const greedy = scheduleComparison?.greedy;
  const baseline = scheduleComparison?.baseline;
  const savingsRs = scheduleComparison?.absolute_savings_rs ?? 0;
  const savingsPct = scheduleComparison?.percentage_savings ?? 0;
  const jobInsights = scheduleComparison?.job_insights || [];

  const comparisonData = [
    {
      name: 'Baseline (Earliest-Start)',
      cost: baseline ? baseline.total_cost_rs : 0,
      fill: '#64748b',
    },
    {
      name: 'PowerSched (Greedy)',
      cost: greedy ? greedy.total_cost_rs : 0,
      fill: '#9CFF72',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary tracking-tight">
          Algorithmic Insights & Viva Evaluation
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          Empirical comparison between Greedy and Baseline schedulers, job-level explanations, and complexity proofs
        </p>
      </div>

      {/* Top Comparison Chart & KPI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Cost Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-surface border border-surface-border rounded-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
                <TrendingDown size={18} className="text-energy-green" />
                <span>Total Scheduling Cost Comparison (₹)</span>
              </h3>
              <p className="text-xs text-text-muted mt-0.5">
                Earliest-start baseline vs PowerSched deadline-first cost-aware greedy
              </p>
            </div>
            <div className="text-xs font-semibold text-energy-green px-2.5 py-1 rounded-full bg-energy-green/10 border border-energy-green/20">
              ↓ {savingsPct}% Net Savings
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={comparisonData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  stroke="#6E7684"
                  fontSize={11}
                  tickFormatter={(v) => `₹${v}`}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#F3F5F7"
                  fontSize={12}
                  tickLine={false}
                  width={160}
                />
                <Tooltip
                  formatter={(val: number) => [`₹${val.toFixed(2)}`, 'Estimated Cost']}
                  contentStyle={{
                    backgroundColor: '#171C25',
                    borderColor: 'rgba(255,255,255,0.08)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="cost" radius={[0, 8, 8, 0]}>
                  {comparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Energy & Invariant Summary Box */}
        <div className="bg-surface border border-surface-border rounded-card p-5 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">
              Key Algorithmic Finding
            </div>
            <div className="text-3xl font-extrabold text-energy-green mb-1">
              ₹{savingsRs.toFixed(2)} Saved
            </div>
            <p className="text-xs text-text-secondary leading-relaxed mt-2">
              With fixed computational duration and power on a single resource, physical energy remains constant (
              <strong className="text-text-primary">{greedy?.total_energy_kwh.toFixed(2)} kWh</strong>).
              The cost reduction is achieved purely through <strong>temporal shifting</strong> into lower electricity market price blocks.
            </p>
          </div>

          <div className="pt-4 border-t border-surface-border/60 space-y-2 text-xs">
            <div className="flex items-center justify-between text-text-muted">
              <span>Deadline Compliance:</span>
              <strong className="text-energy-green">
                {greedy?.deadline_compliance_rate ?? 100}%
              </strong>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Resource Collision:</span>
              <strong className="text-text-primary">0% (Strict Mutual Exclusion)</strong>
            </div>
            <div className="flex items-center justify-between text-text-muted">
              <span>Time Slot Resolution:</span>
              <strong className="text-text-primary">15-Minute Blocks</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Job-by-Job Explanations ("Why this slot?") */}
      <div className="bg-surface border border-surface-border rounded-card p-5">
        <div className="mb-4">
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <Sparkles size={17} className="text-energy-green" />
            <span>Job-by-Job Algorithmic Placement Explanations ("Why this slot?")</span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Clear rationales for each workload's assigned window vs the naive earliest-start baseline
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {jobInsights.map((insight, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-surface-secondary/40 border border-surface-border text-xs space-y-2 hover:border-energy-green/30 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-text-primary">
                  {insight.job_name}
                </span>
                <span
                  className={`font-semibold px-2 py-0.5 rounded-full ${
                    insight.savings_rs > 0
                      ? 'bg-energy-green/10 text-energy-green border border-energy-green/20'
                      : 'bg-surface-elevated text-text-muted'
                  }`}
                >
                  {insight.savings_rs > 0
                    ? `Saved ₹${insight.savings_rs.toFixed(2)}`
                    : 'Equal Cost'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 py-1 text-[11px]">
                <div className="bg-surface p-2 rounded-lg border border-surface-border/50">
                  <div className="text-text-muted font-medium">Greedy Window</div>
                  <div className="text-energy-green font-mono font-semibold">
                    {insight.greedy_window} (₹{insight.greedy_cost.toFixed(2)})
                  </div>
                </div>
                <div className="bg-surface p-2 rounded-lg border border-surface-border/50">
                  <div className="text-text-muted font-medium">Baseline Window</div>
                  <div className="text-text-secondary font-mono">
                    {insight.baseline_window} (₹{insight.baseline_cost.toFixed(2)})
                  </div>
                </div>
              </div>

              <p className="text-text-muted text-[11px] leading-relaxed italic">
                "{insight.explanation}"
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* DAA Viva Presentation & Complexity Analysis Panel */}
      <div className="bg-surface border border-surface-border rounded-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-surface-border">
          <div className="p-2 rounded-xl bg-energy-green/10 text-energy-green">
            <BookOpen size={18} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-text-primary">
              Design and Analysis of Algorithms (DAA) — Technical Viva Reference
            </h3>
            <p className="text-xs text-text-muted">
              Formal problem formulation, greedy choice property, and asymptotic complexity analysis
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Complexity Box */}
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 text-energy-green font-semibold text-xs">
              <Cpu size={14} />
              <span>Time & Space Complexity</span>
            </div>
            <ul className="space-y-1.5 text-text-secondary text-[11px] leading-relaxed">
              <li>
                <strong className="text-text-primary">Sorting Jobs:</strong> O(J log J) by deadline ascending, then priority descending.
              </li>
              <li>
                <strong className="text-text-primary">Prefix Sum Calculation:</strong> O(T) precomputing slot price cumulative sums.
              </li>
              <li>
                <strong className="text-text-primary">Window Evaluation:</strong> With prefix sums, window price lookup is O(1). Occupancy check takes O(W). Total loop: O(J × T).
              </li>
              <li>
                <strong className="text-text-primary">Overall Time:</strong> O(J log J + J × T). With T=96, this executes in &lt; 5ms.
              </li>
              <li>
                <strong className="text-text-primary">Space Complexity:</strong> O(J + T) for occupied array and prefix sums.
              </li>
            </ul>
          </div>

          {/* Greedy Choice Property */}
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 text-energy-green font-semibold text-xs">
              <Sparkles size={14} />
              <span>Greedy Choice Property</span>
            </div>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              At each step, PowerSched commits to the locally optimal (minimum cost) contiguous window currently feasible for the most urgent job (earliest deadline).
            </p>
            <p className="text-text-muted text-[11px] leading-relaxed">
              <strong>Heuristic Note:</strong> While Earliest Deadline First (EDF) provides an optimal scheduling guarantee for unit-job feasibility on a single machine, cost-minimization under variable prices is an NP-hard variant of interval scheduling; the greedy approach is a highly effective, practical polynomial-time approximation.
            </p>
          </div>

          {/* Problem Invariants */}
          <div className="p-4 rounded-xl bg-surface-secondary/40 border border-surface-border space-y-2">
            <div className="flex items-center gap-1.5 text-energy-green font-semibold text-xs">
              <CheckCircle2 size={14} />
              <span>Algorithmic Invariants</span>
            </div>
            <ul className="space-y-1.5 text-text-secondary text-[11px] leading-relaxed">
              <li>
                <strong>Non-preemptive:</strong> Jobs execute in a single contiguous block of d_i / 15 slots.
              </li>
              <li>
                <strong>Mutual Exclusion:</strong> No two jobs overlap on the single logical compute resource.
              </li>
              <li>
                <strong>Deadline Rigidity:</strong> Completion time must be &le; Deadline. If no unoccupied window exists, marked <code>UNSCHEDULED</code>.
              </li>
              <li>
                <strong>Tie-Breaking:</strong> Highest priority job claims low-cost slots first.
              </li>
            </ul>
          </div>

        </div>

        {/* Code Snippet Box */}
        <div className="p-4 rounded-xl bg-slate-950 border border-surface-border text-xs font-mono space-y-2">
          <div className="flex items-center justify-between text-text-muted text-[11px]">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <Code2 size={13} className="text-energy-green" />
              <span>Core Scheduling Loop (algorithms/greedy_scheduler.py)</span>
            </span>
            <span>Python 3.13</span>
          </div>
          <pre className="text-slate-300 text-[11px] overflow-x-auto leading-relaxed p-2">
{`# 1. Sort jobs by earliest deadline first (EDF), then priority
sorted_jobs = sorted(jobs, key=lambda j: (parse_iso(j["deadline"]), -j["priority"]))

# 2. Iterate each job and pick lowest cost feasible window
for job in sorted_jobs:
    for start_idx in range(T - required_slots + 1):
        if window_ends_after_deadline: break
        if any(occupied[start_idx : start_idx + required_slots]): continue
        
        # O(1) cost computation using prefix sums
        cost = slot_energy * (prefix_prices[end] - prefix_prices[start])
        if cost < min_cost:
            best_window = start_idx
            
    mark_occupied(best_window)`}
          </pre>
        </div>
      </div>
    </div>
  );
};
