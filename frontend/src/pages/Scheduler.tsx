import React, { useState } from 'react';
import {
  CalendarClock,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Layers,
  Zap,
} from 'lucide-react';
import { ScheduleTimeline } from '../components/ScheduleTimeline';
import { PriceRibbon } from '../components/PriceRibbon';
import { StatusBadge } from '../components/StatusBadge';
import { PriceHorizon, ScheduleComparison } from '../types';

interface SchedulerProps {
  priceHorizon: PriceHorizon | null;
  scheduleComparison: ScheduleComparison | null;
  onGenerateSchedule: () => Promise<void>;
  isGenerating?: boolean;
}

export const Scheduler: React.FC<SchedulerProps> = ({
  priceHorizon,
  scheduleComparison,
  onGenerateSchedule,
  isGenerating = false,
}) => {
  // Toggle between viewing Greedy schedule vs Baseline schedule on the timeline
  const [activeViewStrategy, setActiveViewStrategy] = useState<'greedy' | 'baseline'>('greedy');

  const currentSchedule =
    activeViewStrategy === 'greedy'
      ? scheduleComparison?.greedy
      : scheduleComparison?.baseline;

  const scheduledJobs =
    currentSchedule?.jobs.filter((j) => j.status === 'scheduled') || [];
  const unscheduledJobs =
    currentSchedule?.jobs.filter((j) => j.status === 'unscheduled') || [];

  const occupiedSlots = new Set<number>();
  scheduledJobs.forEach((j) => j.slot_indexes.forEach((idx) => occupiedSlots.add(idx)));

  const greedyCost = scheduleComparison?.greedy.total_cost_rs ?? 0;
  const baselineCost = scheduleComparison?.baseline.total_cost_rs ?? 0;
  const savingsRs = scheduleComparison?.absolute_savings_rs ?? 0;
  const savingsPct = scheduleComparison?.percentage_savings ?? 0;

  return (
    <div className="space-y-6">
      {/* Header & Generate Schedule Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold text-text-primary tracking-tight">Algorithmic Scheduler</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-energy-green/10 text-energy-green font-medium border border-energy-green/20">
              Hero Demonstration
            </span>
          </div>
          <p className="text-sm text-text-muted mt-0.5">
            Greedy deadline-first window allocation against 15-minute market clearing prices
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onGenerateSchedule}
            disabled={isGenerating}
            className="flex items-center gap-2 px-5 py-2.5 rounded-btn bg-energy-green hover:bg-energy-dim text-slate-950 font-bold text-sm transition-all shadow-lg shadow-energy-green/25 disabled:opacity-50"
          >
            <Sparkles size={16} className={isGenerating ? 'animate-spin' : ''} />
            <span>{isGenerating ? 'Computing Schedule...' : 'Generate Schedule'}</span>
          </button>
        </div>
      </div>

      {/* Control Pill Bar & View Strategy Toggle */}
      <div className="bg-surface border border-surface-border rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary border border-surface-border text-text-secondary">
            <span className="text-text-muted">Market:</span>
            <strong className="text-text-primary">IEX DAM</strong>
            <StatusBadge status={priceHorizon?.source || 'DEMO'} size="sm" />
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary border border-surface-border text-text-secondary">
            <span className="text-text-muted">Horizon:</span>
            <strong className="text-text-primary">Today (96 Blocks / 24h)</strong>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-secondary border border-surface-border text-text-secondary">
            <span className="text-text-muted">Resource:</span>
            <strong className="text-text-primary">Single Compute Node</strong>
          </div>
        </div>

        {/* Strategy Switcher Toggle */}
        <div className="flex items-center gap-2 bg-surface-secondary/70 p-1 rounded-xl border border-surface-border">
          <button
            onClick={() => setActiveViewStrategy('greedy')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewStrategy === 'greedy'
                ? 'bg-energy-green text-slate-950 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Sparkles size={13} />
            <span>PowerSched (Greedy)</span>
          </button>
          <button
            onClick={() => setActiveViewStrategy('baseline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeViewStrategy === 'baseline'
                ? 'bg-slate-200 text-slate-950 shadow-sm'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            <Layers size={13} />
            <span>Baseline (First-Fit)</span>
          </button>
        </div>
      </div>

      {/* Schedule Optimization Result Banner */}
      {scheduleComparison && (
        <div className="bg-surface-elevated border border-energy-green/30 rounded-card p-5 shadow-xl shadow-energy-green/5 relative overflow-hidden">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-medium text-energy-green uppercase tracking-wider">
                <CheckCircle2 size={14} />
                <span>Optimization Result</span>
              </div>
              <div className="text-2xl font-bold text-text-primary mt-1">
                {scheduleComparison.greedy.scheduled_count} / {scheduleComparison.greedy.total_jobs} Scheduled
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                {scheduleComparison.greedy.unscheduled_count > 0
                  ? `${scheduleComparison.greedy.unscheduled_count} jobs missed deadline constraints`
                  : 'All deadlines satisfied'}
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-medium">
                PowerSched Estimated Cost
              </div>
              <div className="text-2xl font-bold text-energy-green mt-1">
                ₹{greedyCost.toFixed(2)}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                Cheapest feasible window assignment
              </div>
            </div>

            <div>
              <div className="text-xs text-text-muted uppercase tracking-wider font-medium">
                Baseline (Earliest-Start)
              </div>
              <div className="text-2xl font-bold text-text-secondary mt-1">
                ₹{baselineCost.toFixed(2)}
              </div>
              <div className="text-xs text-text-muted mt-0.5">
                First available window without price awareness
              </div>
            </div>

            <div className="bg-energy-green/10 border border-energy-green/20 rounded-2xl p-3 flex flex-col justify-center">
              <div className="text-xs text-energy-green font-semibold uppercase tracking-wider">
                Estimated Net Savings
              </div>
              <div className="text-2xl font-extrabold text-energy-green mt-0.5 flex items-baseline gap-1">
                <span>₹{savingsRs.toFixed(2)}</span>
                <span className="text-sm font-semibold text-energy-green">
                  (↓ {savingsPct}%)
                </span>
              </div>
              <div className="text-[11px] text-text-muted mt-0.5">
                Temporal shifting saving vs early execution
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Electricity Price Intensity Ribbon */}
      {priceHorizon && (
        <div className="bg-surface border border-surface-border rounded-2xl p-4">
          <PriceRibbon slots={priceHorizon.slots} occupiedSlotIndices={occupiedSlots} />
        </div>
      )}

      {/* Hero 24-Hour Horizon Execution Timeline */}
      <ScheduleTimeline
        scheduledJobs={scheduledJobs}
        unscheduledJobs={unscheduledJobs}
        slots={priceHorizon?.slots || []}
        strategyName={activeViewStrategy === 'greedy' ? 'PowerSched Greedy' : 'Baseline First-Fit'}
      />
    </div>
  );
};
