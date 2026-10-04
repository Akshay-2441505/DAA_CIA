import React from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarClock,
  Sparkles,
  BookOpen,
} from 'lucide-react';

export type NavTab = 'overview' | 'jobs' | 'scheduler' | 'insights';

interface SidebarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  jobCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onSelectTab, jobCount }) => {
  const navItems = [
    {
      id: 'overview' as NavTab,
      label: 'Overview',
      icon: LayoutDashboard,
      desc: 'System snapshot & pricing',
    },
    {
      id: 'jobs' as NavTab,
      label: 'Jobs',
      icon: Layers,
      desc: 'Workload management',
      badge: jobCount > 0 ? jobCount : undefined,
    },
    {
      id: 'scheduler' as NavTab,
      label: 'Scheduler',
      icon: CalendarClock,
      desc: '24h Execution timeline',
      highlight: true,
    },
    {
      id: 'insights' as NavTab,
      label: 'Insights & Viva',
      icon: Sparkles,
      desc: 'Greedy vs Baseline comparison',
    },
  ];

  return (
    <aside className="w-64 border-r border-surface-border bg-surface/50 p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="space-y-1.5">
        <div className="px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
          Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all relative ${
                isActive
                  ? 'bg-surface-elevated text-text-primary font-medium border border-surface-border shadow-sm'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-secondary/60'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-energy-green" />
              )}
              <Icon
                size={18}
                className={isActive ? 'text-energy-green' : 'text-text-muted'}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm truncate">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-surface-secondary text-text-muted">
                      {item.badge}
                    </span>
                  )}
                  {item.highlight && (
                    <span className="w-1.5 h-1.5 rounded-full bg-energy-green/80 animate-ping" />
                  )}
                </div>
                <p className="text-[11px] text-text-muted truncate">{item.desc}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Academic disclaimer box */}
      <div className="p-3.5 rounded-2xl bg-surface-secondary/40 border border-surface-border text-xs text-text-muted space-y-1.5">
        <div className="flex items-center gap-1.5 text-text-secondary font-medium">
          <BookOpen size={13} className="text-energy-green" />
          <span>Academic Disclaimer</span>
        </div>
        <p className="text-[11px] leading-relaxed">
          PowerSched models wholesale IEX market signals for DAA algorithmic study. Values do not represent retail residential consumer tariffs.
        </p>
      </div>
    </aside>
  );
};
