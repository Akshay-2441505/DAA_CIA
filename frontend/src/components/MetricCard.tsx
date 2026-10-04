import React from 'react';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  subValue?: string;
  icon?: LucideIcon;
  trend?: {
    text: string;
    isPositive?: boolean;
    isNeutral?: boolean;
  };
  highlight?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  subValue,
  icon: Icon,
  trend,
  highlight = false,
}) => {
  return (
    <div
      className={`relative overflow-hidden rounded-card border transition-all duration-300 p-5 ${
        highlight
          ? 'bg-surface-elevated/90 border-energy-green/40 shadow-[0_0_24px_rgba(156,255,114,0.08)]'
          : 'bg-surface border-surface-border hover:border-surface-border/80 hover:bg-surface-elevated/40'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {label}
        </span>
        {Icon && (
          <div
            className={`p-2 rounded-xl ${
              highlight
                ? 'bg-energy-green/10 text-energy-green'
                : 'bg-surface-secondary text-text-secondary'
            }`}
          >
            <Icon size={16} />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-1.5 mb-1.5">
        <span className="text-3xl font-semibold tracking-tight text-text-primary">
          {value}
        </span>
        {unit && (
          <span className="text-sm font-medium text-text-secondary">{unit}</span>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-text-muted mt-2">
        {subValue && <span>{subValue}</span>}
        {trend && (
          <span
            className={`inline-flex items-center font-medium ${
              trend.isNeutral
                ? 'text-text-secondary'
                : trend.isPositive
                ? 'text-energy-green'
                : 'text-rose-400'
            }`}
          >
            {trend.text}
          </span>
        )}
      </div>
    </div>
  );
};
