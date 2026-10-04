import React from 'react';
import { Zap, RefreshCw } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

interface HeaderProps {
  priceSource: string;
  onRefreshPrices: () => Promise<void>;
  isRefreshing?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  priceSource,
  onRefreshPrices,
  isRefreshing = false,
}) => {
  return (
    <header className="h-16 border-b border-surface-border bg-surface/80 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-energy-green/10 border border-energy-green/20 flex items-center justify-center text-energy-green shadow-[0_0_12px_rgba(156,255,114,0.15)]">
          <Zap size={20} className="fill-energy-green/30" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-text-primary tracking-tight">PowerSched</h1>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-surface-secondary text-text-muted border border-surface-border">
              DAA CIA-3
            </span>
          </div>
          <p className="text-[11px] text-text-muted">Greedy Algorithm Energy Optimization</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-secondary/70 border border-surface-border text-xs">
          <span className="text-text-muted">Market Signal:</span>
          <span className="font-semibold text-text-primary">IEX DAM (National)</span>
          <StatusBadge status={priceSource || 'DEMO'} size="sm" />
        </div>

        <button
          onClick={onRefreshPrices}
          disabled={isRefreshing}
          className="p-2 rounded-xl bg-surface-secondary hover:bg-surface-elevated text-text-secondary hover:text-text-primary border border-surface-border transition-all disabled:opacity-50"
          title="Refresh market clearing prices"
        >
          <RefreshCw size={15} className={isRefreshing ? 'animate-spin text-energy-green' : ''} />
        </button>
      </div>
    </header>
  );
};
