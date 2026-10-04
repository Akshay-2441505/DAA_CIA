import {
  Job,
  JobInput,
  PriceHorizon,
  CurrentPriceStatus,
  ScheduleResult,
  ScheduleComparison,
  AnalyticsSummary,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let errMsg = `API error (${res.status})`;
    try {
      const errData = await res.json();
      errMsg = errData.detail || errData.message || errMsg;
    } catch {
      // ignore json parse error
    }
    throw new Error(errMsg);
  }
  return res.json();
}

export const api = {
  // Jobs
  async getJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE_URL}/api/jobs`);
    return handleResponse<Job[]>(res);
  },

  async createJob(job: JobInput): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/api/jobs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    return handleResponse<Job>(res);
  },

  async updateJob(id: number, job: Partial<JobInput>): Promise<Job> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job),
    });
    return handleResponse<Job>(res);
  },

  async deleteJob(id: number): Promise<{ success: boolean; message: string }> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/${id}`, {
      method: 'DELETE',
    });
    return handleResponse<{ success: boolean; message: string }>(res);
  },

  async seedDemoJobs(): Promise<Job[]> {
    const res = await fetch(`${API_BASE_URL}/api/jobs/seed-demo`, {
      method: 'POST',
    });
    return handleResponse<Job[]>(res);
  },

  // Prices
  async getCurrentPrice(): Promise<CurrentPriceStatus> {
    const res = await fetch(`${API_BASE_URL}/api/prices/current`);
    return handleResponse<CurrentPriceStatus>(res);
  },

  async getTodayPrices(forceRefresh: boolean = false): Promise<PriceHorizon> {
    const url = forceRefresh
      ? `${API_BASE_URL}/api/prices/refresh`
      : `${API_BASE_URL}/api/prices/today`;
    const res = await fetch(url, {
      method: forceRefresh ? 'POST' : 'GET',
    });
    return handleResponse<PriceHorizon>(res);
  },

  // Schedules
  async generateSchedule(): Promise<ScheduleComparison> {
    const res = await fetch(`${API_BASE_URL}/api/schedules/generate`, {
      method: 'POST',
    });
    return handleResponse<ScheduleComparison>(res);
  },

  async getLatestSchedule(strategy: 'greedy' | 'baseline' = 'greedy'): Promise<ScheduleResult> {
    const res = await fetch(`${API_BASE_URL}/api/schedules/latest?strategy=${strategy}`);
    return handleResponse<ScheduleResult>(res);
  },

  async getScheduleComparison(): Promise<ScheduleComparison> {
    const res = await fetch(`${API_BASE_URL}/api/schedules/comparison`);
    return handleResponse<ScheduleComparison>(res);
  },

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const res = await fetch(`${API_BASE_URL}/api/analytics/summary`);
    return handleResponse<AnalyticsSummary>(res);
  },
};
