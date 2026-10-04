export interface Job {
  id: number;
  name: string;
  duration_minutes: number;

  power_watts: number;
  deadline: string;
  priority: number;
  created_at: string;
  updated_at: string;
}

export interface JobInput {
  name: string;
  duration_minutes: number;
  power_watts: number;
  deadline: string;
  priority: number;
}

export interface PriceSlot {
  index: number;
  start_time: string;
  end_time: string;
  price_rs_mwh: number;
  price_rs_kwh: number;
  source: string;
}

export interface PriceHorizon {
  horizon_date: string;
  source: string;
  fetched_at: string;
  slot_count: number;
  min_price_kwh: number;
  max_price_kwh: number;
  avg_price_kwh: number;
  cheapest_slot?: PriceSlot;
  most_expensive_slot?: PriceSlot;
  slots: PriceSlot[];
}

export interface CurrentPriceStatus {
  current_time: string;
  current_slot?: PriceSlot;
  cheapest_upcoming_window?: {
    start_time: string;
    end_time: string;
    avg_price_kwh: number;
    duration_minutes: number;
  };
  source: string;
  last_updated: string;
}

export interface ScheduledJobItem {
  job_id: number;
  job_name: string;
  start_time?: string;
  end_time?: string;
  slot_indexes: number[];
  duration_minutes: number;
  power_watts: number;
  energy_kwh: number;
  estimated_cost_rs: number;
  status: 'scheduled' | 'unscheduled';
  reason?: string;
  deadline: string;
  priority: number;
}

export interface ScheduleResult {
  id?: number;
  strategy: 'greedy' | 'baseline';
  horizon_start: string;
  horizon_end: string;
  total_jobs: number;
  scheduled_count: number;
  unscheduled_count: number;
  total_energy_kwh: number;
  total_cost_rs: number;
  deadline_compliance_rate: number;
  created_at: string;
  jobs: ScheduledJobItem[];
}

export interface JobInsight {
  job_name: string;
  greedy_window: string;
  baseline_window: string;
  greedy_cost: number;
  baseline_cost: number;
  savings_rs: number;
  explanation: string;
}

export interface ScheduleComparison {
  greedy: ScheduleResult;
  baseline: ScheduleResult;
  absolute_savings_rs: number;
  percentage_savings: number;
  total_energy_kwh: number;
  summary_explanation: string;
  job_insights: JobInsight[];
}

export interface AnalyticsSummary {
  current_price_signal: {
    price_rs_kwh: number;
    price_rs_mwh: number;
    market: string;
    source: string;
    timestamp: string;
  };
  cheapest_window?: {
    start_time: string;
    end_time: string;
    avg_price_kwh: number;
    duration_minutes: number;
  };
  jobs_summary: {
    total_jobs: number;
    scheduled: number;
    unscheduled: number;
    deadline_compliance: number;
  };
  energy_metrics: {
    total_energy_kwh: number;
    powersched_cost_rs: number;
    baseline_cost_rs: number;
    estimated_savings_rs: number;
    estimated_savings_pct: number;
  };
  highlight_insight: string;
}
