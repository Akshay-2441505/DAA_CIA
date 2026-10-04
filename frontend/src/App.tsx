import React, { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Layers,
  CalendarClock,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { api } from './services/api';
import {
  Job,
  JobInput,
  PriceHorizon,
  CurrentPriceStatus,
  ScheduleComparison,
  AnalyticsSummary,
} from './types';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { Overview } from './pages/Overview';
import { Jobs } from './pages/Jobs';
import { Scheduler } from './pages/Scheduler';
import { Insights } from './pages/Insights';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavTab>('overview');

  const [jobs, setJobs] = useState<Job[]>([]);
  const [priceHorizon, setPriceHorizon] = useState<PriceHorizon | null>(null);
  const [currentPrice, setCurrentPrice] = useState<CurrentPriceStatus | null>(null);
  const [scheduleComparison, setScheduleComparison] = useState<ScheduleComparison | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Initial data loading
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    setErrorBanner(null);
    try {
      const [fetchedJobs, fetchedPrices, fetchedCurrent, fetchedAnalytics] =
        await Promise.all([
          api.getJobs(),
          api.getTodayPrices(),
          api.getCurrentPrice(),
          api.getAnalyticsSummary(),
        ]);

      setJobs(fetchedJobs);
      setPriceHorizon(fetchedPrices);
      setCurrentPrice(fetchedCurrent);
      setAnalytics(fetchedAnalytics);

      // Attempt to load existing comparison schedule
      try {
        const comparison = await api.getScheduleComparison();
        setScheduleComparison(comparison);
      } catch {
        // comparison can be generated on demand
      }
    } catch (err: any) {
      console.error('Failed to load application data:', err);
      setErrorBanner(
        'Could not connect to backend server. Make sure the FastAPI server is running on http://localhost:8000.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshPrices = async () => {
    setIsRefreshing(true);
    try {
      const refreshed = await api.getTodayPrices(true);
      const curr = await api.getCurrentPrice();
      setPriceHorizon(refreshed);
      setCurrentPrice(curr);
    } catch (err: any) {
      console.error('Price refresh error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAddJob = async (jobInput: JobInput) => {
    try {
      const newJob = await api.createJob(jobInput);
      setJobs((prev) => [newJob, ...prev]);
      // Re-generate schedule and analytics
      handleGenerateSchedule();
    } catch (err: any) {
      alert(`Error creating job: ${err.message}`);
    }
  };

  const handleDeleteJob = async (jobId: number) => {
    try {
      await api.deleteJob(jobId);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
      // Re-generate schedule
      handleGenerateSchedule();
    } catch (err: any) {
      alert(`Error deleting job: ${err.message}`);
    }
  };

  const handleSeedDemoJobs = async () => {
    try {
      const seeded = await api.seedDemoJobs();
      setJobs(seeded);
      await handleGenerateSchedule();
    } catch (err: any) {
      alert(`Error seeding demo jobs: ${err.message}`);
    }
  };

  const handleGenerateSchedule = async () => {
    setIsGenerating(true);
    try {
      const comparison = await api.generateSchedule();
      setScheduleComparison(comparison);
      const updatedAnalytics = await api.getAnalyticsSummary();
      setAnalytics(updatedAnalytics);
    } catch (err: any) {
      alert(`Failed to generate schedule: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const scheduledJobIds = new Set<number>(
    scheduleComparison?.greedy.jobs
      .filter((j) => j.status === 'scheduled')
      .map((j) => j.job_id) || []
  );

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col font-sans selection:bg-energy-green selection:text-black">
      {/* Header */}
      <Header
        priceSource={priceHorizon?.source || 'DEMO'}
        onRefreshPrices={handleRefreshPrices}
        isRefreshing={isRefreshing}
      />

      {/* Error Alert Banner if Backend Unreachable */}
      {errorBanner && (
        <div className="bg-rose-950/80 border-b border-rose-500/30 px-6 py-2.5 text-xs text-rose-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-rose-400" />
            <span>{errorBanner}</span>
          </div>
          <button
            onClick={loadAllData}
            className="px-2.5 py-1 rounded bg-rose-900/60 hover:bg-rose-800 text-xs font-semibold text-rose-100 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Body */}
      <div className="flex flex-1">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          jobCount={jobs.length}
        />

        {/* Dynamic Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full pb-20 md:pb-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-28 text-center space-y-3">
              <div className="w-10 h-10 border-2 border-energy-green border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-medium text-text-secondary">
                Initializing PowerSched market feeds...
              </p>
            </div>
          ) : (
            <>
              {currentTab === 'overview' && (
                <Overview
                  priceHorizon={priceHorizon}
                  currentPrice={currentPrice}
                  analytics={analytics}
                  latestSchedule={scheduleComparison?.greedy || null}
                  onNavigateToScheduler={() => setCurrentTab('scheduler')}
                  onNavigateToJobs={() => setCurrentTab('jobs')}
                />
              )}

              {currentTab === 'jobs' && (
                <Jobs
                  jobs={jobs}
                  onAddJob={handleAddJob}
                  onDeleteJob={handleDeleteJob}
                  onSeedDemoJobs={handleSeedDemoJobs}
                  scheduledJobIds={scheduledJobIds}
                />
              )}

              {currentTab === 'scheduler' && (
                <Scheduler
                  priceHorizon={priceHorizon}
                  scheduleComparison={scheduleComparison}
                  onGenerateSchedule={handleGenerateSchedule}
                  isGenerating={isGenerating}
                />
              )}

              {currentTab === 'insights' && (
                <Insights scheduleComparison={scheduleComparison} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface-elevated/95 backdrop-blur-md border-t border-surface-border flex items-center justify-around px-2 z-40">
        {[
          { id: 'overview' as NavTab, label: 'Overview', icon: LayoutDashboard },
          { id: 'jobs' as NavTab, label: 'Jobs', icon: Layers },
          { id: 'scheduler' as NavTab, label: 'Scheduler', icon: CalendarClock },
          { id: 'insights' as NavTab, label: 'Insights', icon: Sparkles },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition-colors ${
                isActive ? 'text-energy-green' : 'text-text-muted hover:text-text-secondary'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-energy-green' : ''} />
              <span className="mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default App;
