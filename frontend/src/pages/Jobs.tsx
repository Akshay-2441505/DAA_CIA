import React, { useState } from 'react';
import { Plus, Trash2, Zap, Clock, Flag, Sparkles, AlertCircle } from 'lucide-react';
import { Job, JobInput } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { AddJobModal } from '../components/AddJobModal';

interface JobsProps {
  jobs: Job[];
  onAddJob: (job: JobInput) => Promise<void>;
  onDeleteJob: (id: number) => Promise<void>;
  onSeedDemoJobs: () => Promise<void>;
  scheduledJobIds?: Set<number>;
}

export const Jobs: React.FC<JobsProps> = ({
  jobs,
  onAddJob,
  onDeleteJob,
  onSeedDemoJobs,
  scheduledJobIds = new Set(),
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  const handleSeed = async () => {
    setIsSeeding(true);
    try {
      await onSeedDemoJobs();
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-text-primary tracking-tight">Computational Jobs</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Manage workloads, deadlines, and power estimates for algorithmic scheduling
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSeed}
            disabled={isSeeding}
            className="flex items-center gap-2 px-3.5 py-2 rounded-btn bg-surface border border-surface-border hover:border-energy-green/40 text-text-secondary hover:text-text-primary text-xs font-medium transition-all"
            title="Reset and populate with standard academic demonstration workloads"
          >
            <Sparkles size={14} className="text-energy-green" />
            <span>{isSeeding ? 'Seeding...' : 'Load Academic Demo Jobs'}</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-btn bg-energy-green hover:bg-energy-dim text-slate-950 font-semibold text-xs transition-all shadow-md shadow-energy-green/20"
          >
            <Plus size={15} />
            <span>Add Workload</span>
          </button>
        </div>
      </div>

      {/* Jobs Summary Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted">Total Registered Workloads</div>
            <div className="text-2xl font-bold text-text-primary mt-1">{jobs.length}</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-secondary flex items-center justify-center text-text-secondary">
            {jobs.length}
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted">Total Computational Power</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {(jobs.reduce((acc, j) => acc + j.power_watts, 0) / 1000).toFixed(2)} kW
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-energy-green/10 text-energy-green flex items-center justify-center">
            <Zap size={18} />
          </div>
        </div>

        <div className="bg-surface border border-surface-border rounded-2xl p-4 flex items-center justify-between">
          <div>
            <div className="text-xs text-text-muted">Total Execution Time</div>
            <div className="text-2xl font-bold text-text-primary mt-1">
              {(jobs.reduce((acc, j) => acc + j.duration_minutes, 0) / 60).toFixed(1)} hrs
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-secondary text-text-secondary flex items-center justify-center">
            <Clock size={18} />
          </div>
        </div>
      </div>

      {/* Jobs Table */}
      <div className="bg-surface border border-surface-border rounded-card overflow-hidden">
        {jobs.length === 0 ? (
          <div className="text-center py-16 px-4 space-y-3">
            <div className="w-12 h-12 rounded-full bg-surface-secondary flex items-center justify-center text-text-muted mx-auto">
              <AlertCircle size={22} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-text-primary">No Workloads Found</h3>
              <p className="text-xs text-text-muted max-w-sm mx-auto mt-1">
                Add your computational jobs with power and deadline requirements, or click "Load Academic Demo Jobs" to seed 8 standard benchmark tasks.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={handleSeed}
                className="px-4 py-2 rounded-btn bg-surface-secondary hover:bg-surface-elevated text-text-primary text-xs font-medium border border-surface-border transition-colors"
              >
                Load Demo Dataset
              </button>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-btn bg-energy-green text-slate-950 font-semibold text-xs transition-colors"
              >
                Add Custom Job
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-secondary/50 text-text-muted border-b border-surface-border uppercase tracking-wider font-semibold text-[10px]">
                <tr>
                  <th className="py-3.5 px-4">Job Name</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Power Rating</th>
                  <th className="py-3.5 px-4">Deadline</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/40">
                {jobs.map((job) => {
                  const isScheduled = scheduledJobIds.has(job.id);
                  const deadlineTime = job.deadline.includes('T')
                    ? job.deadline.split('T')[1].substring(0, 5)
                    : job.deadline;

                  return (
                    <tr
                      key={job.id}
                      className="hover:bg-surface-elevated/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-semibold text-text-primary">
                        {job.name}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono">
                        {job.duration_minutes >= 60
                          ? `${(job.duration_minutes / 60).toFixed(1)} hrs (${job.duration_minutes}m)`
                          : `${job.duration_minutes} mins`}
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary">
                        <span className="flex items-center gap-1 font-mono">
                          <Zap size={12} className="text-energy-green" />
                          {job.power_watts} W
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-text-secondary font-mono">
                        {deadlineTime}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                            job.priority >= 4
                              ? 'bg-amber-950/40 text-amber-300 border border-amber-500/20'
                              : 'bg-surface-secondary text-text-secondary'
                          }`}
                        >
                          <Flag size={10} />
                          Level {job.priority}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge
                          status={isScheduled ? 'SCHEDULED' : 'READY'}
                          size="sm"
                        />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteJob(job.id)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-950/30 transition-colors opacity-70 group-hover:opacity-100"
                          title="Delete workload"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Job Modal Dialog */}
      <AddJobModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={onAddJob}
      />
    </div>
  );
};
