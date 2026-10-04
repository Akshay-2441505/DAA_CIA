import React from 'react';
import { ScheduledJobItem, PriceSlot } from '../types';
import { AlertCircle, Clock, Zap, CheckCircle2 } from 'lucide-react';

interface ScheduleTimelineProps {
  scheduledJobs: ScheduledJobItem[];
  unscheduledJobs: ScheduledJobItem[];
  slots: PriceSlot[];
  strategyName?: string;
}

export const ScheduleTimeline: React.FC<ScheduleTimelineProps> = ({
  scheduledJobs,
  unscheduledJobs,
  slots,
  strategyName = 'Greedy',
}) => {
  // 96 slots represents 24 hours (100% width)
  const totalSlots = 96;

  // 2-hour tick marks: 0, 8, 16, 24, 32, 40, 48, 56, 64, 72, 80, 88, 96
  const hourTicks = [
    { hour: '00:00', slot: 0 },
    { hour: '02:00', slot: 8 },
    { hour: '04:00', slot: 16 },
    { hour: '06:00', slot: 24 },
    { hour: '08:00', slot: 32 },
    { hour: '10:00', slot: 40 },
    { hour: '12:00', slot: 48 },
    { hour: '14:00', slot: 56 },
    { hour: '16:00', slot: 64 },
    { hour: '18:00', slot: 72 },
    { hour: '20:00', slot: 80 },
    { hour: '22:00', slot: 88 },
    { hour: '24:00', slot: 96 },
  ];

  // Helper to calculate slot index from deadline ISO
  const getSlotFromIso = (isoStr: string): number => {
    try {
      const d = new Date(isoStr);
      const minutes = d.getHours() * 60 + d.getMinutes();
      return Math.min(Math.floor(minutes / 15), totalSlots);
    } catch {
      return totalSlots;
    }
  };

  return (
    <div className="w-full bg-surface border border-surface-border rounded-card p-5 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
            <span>24-Hour Horizon Execution Timeline</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-energy-green/10 text-energy-green font-medium">
              {strategyName} Allocation
            </span>
          </h3>
          <p className="text-xs text-text-muted mt-0.5">
            Non-preemptive job execution mapped to 15-minute market pricing intervals
          </p>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="w-3 h-3 rounded bg-energy-green/80 inline-block" />
            <span>Scheduled Block</span>
          </div>
          <div className="flex items-center gap-1.5 text-text-muted">
            <span className="w-0.5 h-3 bg-rose-400 inline-block" />
            <span>Deadline Pin</span>
          </div>
        </div>
      </div>

      {/* Timeline container with horizontal scrolling on small screens */}
      <div className="overflow-x-auto pb-3">
        <div className="min-w-[850px] relative">
          {/* Time axis header */}
          <div className="relative h-7 border-b border-surface-border/60 text-[11px] font-mono text-text-muted">
            {hourTicks.map((t) => {
              const leftPct = (t.slot / totalSlots) * 100;
              return (
                <div
                  key={t.hour}
                  className="absolute transform -translate-x-1/2 flex flex-col items-center"
                  style={{ left: `${leftPct}%` }}
                >
                  <span>{t.hour}</span>
                  <div className="w-px h-1.5 bg-surface-border mt-0.5" />
                </div>
              );
            })}
          </div>

          {/* Grid background lines */}
          <div className="relative my-2 min-h-[220px] divide-y divide-surface-border/20">
            {/* Background vertical guides */}
            <div className="absolute inset-0 pointer-events-none flex">
              {hourTicks.map((t) => (
                <div
                  key={t.hour}
                  className="absolute top-0 bottom-0 w-px bg-surface-border/30"
                  style={{ left: `${(t.slot / totalSlots) * 100}%` }}
                />
              ))}
            </div>

            {/* Scheduled Job Rows */}
            {scheduledJobs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-text-muted">
                <Clock className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm font-medium">No jobs currently scheduled</p>
                <p className="text-xs max-w-sm mt-1">
                  Add workloads in the Jobs tab or click "Generate Schedule" to compute optimal low-cost windows.
                </p>
              </div>
            ) : (
              scheduledJobs.map((job) => {
                const startSlot = job.slot_indexes.length > 0 ? job.slot_indexes[0] : 0;
                const slotCount = job.slot_indexes.length;
                const leftPct = (startSlot / totalSlots) * 100;
                const widthPct = Math.max((slotCount / totalSlots) * 100, 2);

                const deadlineSlot = getSlotFromIso(job.deadline);
                const deadlineLeftPct = (deadlineSlot / totalSlots) * 100;

                const startFormatted = job.start_time ? job.start_time.substring(11, 16) : '--:--';
                const endFormatted = job.end_time ? job.end_time.substring(11, 16) : '--:--';
                const deadlineFormatted = job.deadline ? job.deadline.substring(11, 16) : '--:--';

                return (
                  <div key={job.job_id} className="relative py-2.5 group">
                    <div className="flex items-center justify-between text-xs mb-1 px-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-text-primary">{job.job_name}</span>
                        <span className="text-[11px] text-text-muted font-mono">
                          {startFormatted} – {endFormatted} ({job.duration_minutes}m)
                        </span>
                        <span className="text-[11px] text-text-secondary flex items-center gap-0.5">
                          <Zap size={11} className="text-energy-green" />
                          {job.power_watts}W
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="font-semibold text-energy-green">
                          ₹{job.estimated_cost_rs.toFixed(2)}
                        </span>
                        <span className="text-text-muted text-[11px]">
                          Deadline: {deadlineFormatted}
                        </span>
                      </div>
                    </div>

                    {/* Timeline bar track */}
                    <div className="relative h-8 bg-surface-secondary/50 rounded-lg overflow-visible border border-surface-border/40">
                      {/* Deadline line indicator */}
                      <div
                        className="absolute -top-1 -bottom-1 w-0.5 bg-rose-400/80 z-20"
                        style={{ left: `${deadlineLeftPct}%` }}
                        title={`Deadline: ${deadlineFormatted}`}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-rose-400 absolute -top-1 -left-0.5" />
                      </div>

                      {/* Scheduled Job Bar */}
                      <div
                        className="absolute top-1 bottom-1 rounded-md bg-gradient-to-r from-energy-green/80 to-energy-green text-surface border border-energy-green shadow-sm flex items-center px-2 z-10 transition-transform hover:scale-[1.01] cursor-pointer group-hover:brightness-110"
                        style={{
                          left: `${leftPct}%`,
                          width: `${widthPct}%`,
                        }}
                        title={`${job.job_name}: ${startFormatted} - ${endFormatted} | ${job.reason}`}
                      >
                        <span className="text-[11px] font-semibold tracking-tight truncate text-slate-950">
                          {job.job_name}
                        </span>
                      </div>
                    </div>

                    {/* Why this slot explanation tooltip on hover */}
                    {job.reason && (
                      <div className="mt-1 text-[11px] text-text-muted italic flex items-center gap-1">
                        <CheckCircle2 size={11} className="text-energy-green flex-shrink-0" />
                        <span className="truncate">{job.reason}</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Unscheduled Jobs Section */}
      {unscheduledJobs.length > 0 && (
        <div className="mt-6 pt-4 border-t border-surface-border">
          <div className="flex items-center gap-2 mb-3 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <AlertCircle size={14} />
            <span>Unscheduled Workloads ({unscheduledJobs.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unscheduledJobs.map((uj) => (
              <div
                key={uj.job_id}
                className="bg-rose-950/20 border border-rose-500/20 rounded-xl p-3 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-rose-200">{uj.job_name}</span>
                  <span className="text-[11px] font-mono text-rose-300">
                    {uj.duration_minutes}m | {uj.power_watts}W
                  </span>
                </div>
                <p className="text-rose-300/80 text-[11px] mt-1">
                  {uj.reason || 'Could not find a feasible window before deadline.'}
                </p>
                <div className="mt-2 text-[10px] text-text-muted">
                  Deadline: {uj.deadline ? uj.deadline.substring(11, 16) : 'N/A'} (Priority: {uj.priority})
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
