import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'sm' }) => {
  const norm = status.toUpperCase();

  let styles = 'bg-surface-elevated text-text-secondary border-surface-border';
  let dotColor = 'bg-text-muted';

  if (norm === 'LIVE') {
    styles = 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30';
    dotColor = 'bg-emerald-400 animate-pulse';
  } else if (norm === 'CACHED') {
    styles = 'bg-amber-950/40 text-amber-300 border-amber-500/30';
    dotColor = 'bg-amber-400';
  } else if (norm === 'DEMO') {
    styles = 'bg-sky-950/40 text-sky-300 border-sky-500/30';
    dotColor = 'bg-sky-400';
  } else if (norm === 'SCHEDULED') {
    styles = 'bg-lime-950/40 text-energy-green border-energy-green/30';
    dotColor = 'bg-energy-green';
  } else if (norm === 'UNSCHEDULED') {
    styles = 'bg-rose-950/40 text-rose-400 border-rose-500/30';
    dotColor = 'bg-rose-400';
  } else if (norm === 'READY') {
    styles = 'bg-slate-800 text-slate-300 border-slate-700';
    dotColor = 'bg-slate-400';
  }

  const sizeCls = size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm font-medium';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${sizeCls} ${styles} font-medium tracking-wide uppercase`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`} />
      {norm}
    </span>
  );
};
