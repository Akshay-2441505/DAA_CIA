import React from 'react';
import {
  Zap,
  TrendingDown,
  Clock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { MetricCard } from '../components/MetricCard';
import { PriceChart } from '../components/PriceChart';
import { PriceRibbon } from '../components/PriceRibbon';
import { StatusBadge } from '../components/StatusBadge';
import {
  PriceHorizon,
  CurrentPriceStatus,
  AnalyticsSummary,
  ScheduleResult,
} from '../types';

interface OverviewProps {
  priceHorizon: PriceHorizon | null;
  currentPrice: CurrentPriceStatus | null;
  analytics: AnalyticsSummary | null;
  latestSchedule: ScheduleResult | null;
  onNavigateToScheduler: () => void;
  onNavigateToJobs: () => void;
}

export const Overview: React.FC<OverviewProps> = ({
  priceHorizon,
  currentPrice,
  analytics,
  latestSchedule,
  onNavigateToScheduler,
  onNavigateToJobs,
}) => {
  const currentKwh = currentPrice?.current_slot?.price_rs_kwh ?? 5.31;
  const cheapestWindow = currentPrice?.cheapest_upcoming_window;

  const energyKwh = analytics?.energy_metrics.total_energy_kwh ?? 0;
  const costRs = analytics?.energy_metrics.powersched_cost_rs ?? 0;
  const savingsPct = analytics?.energy_metrics.estimated_savings_pct ?? 0;
  const savingsRs = analytics?.energy_metrics.estimated_savings_rs ?? 0;
  const scheduledCount = analytics?.jobs_summary.scheduled ?? 0;
  const totalJobs = analytics?.jobs_summary.total_jobs ?? 0;

  return (
    <div className="space-y-6">
      {/* Page Title & Intro */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">System Overview</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Real-time market signals and energy-aware job scheduling status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateToScheduler}
            className="flex items-center gap-2 px-4 py-2 rounded-btn bg-energy-green hover:bg-energy-dim text-slate-950 font-semibold text-xs transition-all shadow-md shadow-energy-green/20"
          >
            <span>Open Scheduler</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Current Market Signal"
          value={`₹${currentKwh.toFixed(2)}`}
          unit="/ kWh"
          subValue="IEX DAM National clearing price"
          icon={Zap}
          trend={{
            text: priceHorizon?.source || 'DEMO',
            isNeutral: true,
          }}
        />

        <MetricCard
          label="Cheapest Upcoming Window"
          value={
            cheapestWindow
              ? `${cheapestWindow.start_time.substring(11, 16)}–${cheapestWindow.end_time.substring(11, 16)}`
              : '02:00–06:00'
          }
          subValue={
            cheapestWindow
              ? `Avg ₹${cheapestWindow.avg_price_kwh.toFixed(2)} / kWh`
              : 'Overnight demand trough'
          }
          icon={Clock}
          trend={{
            text: 'Optimal Slot',
            isPositive: true,
          }}
        />

        <MetricCard
          label="Scheduled Compute Workload"
          value={`${scheduledCount} / ${totalJobs}`}
          unit="Jobs"
          subValue={`Total Energy: ${energyKwh.toFixed(2)} kWh`}
          icon={CheckCircle2}
          trend={{
            text: `${analytics?.jobs_summary.deadline_compliance ?? 100}% on-time`,
            isPositive: true,
          }}
        />

        <MetricCard
          label="Estimated Scheduling Cost"
          value={`₹${costRs.toFixed(2)}`}
          unit=""
          subValue={savingsRs > 0 ? `Saved ₹${savingsRs.toFixed(2)} vs baseline` : 'Earliest baseline comparison'}
          icon={TrendingDown}
          highlight={savingsPct > 0}
          trend={
            savingsPct > 0
              ? {
                  text: `↓ ${savingsPct}% vs baseline`,
                  isPositive: true,
                }
              : undefined
          }
        />
      </div>

      {/* High-Impact Insight Card */}
      <div className="rounded-card border border-energy-green/30 bg-gradient-to-r from-energy-green/10 via-surface to-surface-elevated p-5 relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-2.5 rounded-2xl bg-energy-green/20 text-energy-green border border-energy-green/30 flex-shrink-0">
            <Sparkles size={20} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-energy-green uppercase tracking-wider">
                Optimization Highlight
              </span>
              <StatusBadge status={priceHorizon?.source || 'DEMO'} size="sm" />
            </div>
            <p className="text-sm font-medium text-text-primary leading-relaxed">
              {analytics?.highlight_insight ||
                'PowerSched moved flexible computational workloads into low-cost electricity market blocks without missing deadlines.'}
            </p>
          </div>
        </div>
      </div>

      {/* Electricity Market Price Curve */}
      <div className="rounded-card bg-surface border border-surface-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
              <BarChart3 size={18} className="text-energy-green" />
              <span>Electricity Market Clearing Price Curve</span>
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              96 continuous 15-minute price blocks for the active 24-hour horizon
            </p>
          </div>
          <div className="text-xs text-text-muted">
            Updated: {priceHorizon?.fetched_at ? priceHorizon.fetched_at.substring(11, 19) : 'Just now'}
          </div>
        </div>

        {priceHorizon && (
          <>
            <PriceRibbon slots={priceHorizon.slots} />
            <PriceChart slots={priceHorizon.slots} height={260} />
          </>
        )}
      </div>

      {/* Schedule Preview Section */}
      <div className="rounded-card bg-surface border border-surface-border p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-text-primary">Today's Schedule Summary</h3>
            <p className="text-xs text-text-muted mt-0.5">
              Current Greedy allocation across computational workloads
            </p>
          </div>
          <button
            onClick={onNavigateToScheduler}
            className="text-xs font-medium text-energy-green hover:underline flex items-center gap-1"
          >
            <span>View Full 24-Hour Timeline</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {latestSchedule && latestSchedule.jobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {latestSchedule.jobs.slice(0, 6).map((job) => (
              <div
                key={job.job_id}
                className="p-3.5 rounded-xl bg-surface-secondary/40 border border-surface-border/60 text-xs flex flex-col justify-between space-y-2 hover:border-surface-border transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-text-primary truncate">{job.job_name}</span>
                  <StatusBadge status={job.status} size="sm" />
                </div>
                <div className="flex items-center justify-between text-text-muted">
                  <span>
                    {job.start_time ? `${job.start_time.substring(11, 16)}–${job.end_time?.substring(11, 16)}` : 'Infeasible'}
                  </span>
                  <span className="font-mono text-energy-green font-medium">
                    {job.estimated_cost_rs > 0 ? `₹${job.estimated_cost_rs.toFixed(2)}` : '—'}
                  </span>
                </div>
                <div className="text-[11px] text-text-muted truncate">
                  Deadline: {job.deadline ? job.deadline.substring(11, 16) : 'N/A'} (Priority: {job.priority})
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-xs text-text-muted">
            <p>No schedule generated yet.</p>
            <button
              onClick={onNavigateToScheduler}
              className="mt-2 text-energy-green font-medium underline"
            >
              Generate first schedule
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
