import React from 'react';
import { useForm } from 'react-hook-form';
import { X, Plus, Clock, Zap, Flag, AlertCircle } from 'lucide-react';
import { JobInput } from '../types';

interface AddJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (job: JobInput) => Promise<void>;
}

interface FormValues {
  name: string;
  duration_minutes: number;
  power_watts: number;
  deadlineTime: string; // HH:MM format
  priority: number;
}

export const AddJobModal: React.FC<AddJobModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    defaultValues: {
      name: '',
      duration_minutes: 60,
      power_watts: 500,
      deadlineTime: '12:00',
      priority: 3,
    },
  });

  if (!isOpen) return null;

  const handleFormSubmit = async (data: FormValues) => {
    // Construct ISO string for deadline today with given HH:MM
    const today = new Date();
    const [hours, minutes] = data.deadlineTime.split(':').map(Number);
    today.setHours(hours, minutes, 0, 0);

    const jobData: JobInput = {
      name: data.name.trim(),
      duration_minutes: Number(data.duration_minutes),
      power_watts: Number(data.power_watts),
      deadline: today.toISOString(),
      priority: Number(data.priority),
    };

    await onSubmit(jobData);
    reset();
    onClose();
  };

  const quickDurations = [15, 30, 45, 60, 120, 240];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface-elevated border border-surface-border w-full max-w-lg rounded-card shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between pb-4 border-b border-surface-border">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-energy-green/10 text-energy-green">
              <Plus size={18} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">Add Computational Workload</h2>
              <p className="text-xs text-text-muted">Define job constraints for greedy schedule optimization</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-secondary transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 mt-5">
          {/* Job Name */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Job Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Daily Data Backup or LLM Fine-tuning"
              {...register('name', {
                required: 'Job name is required',
                minLength: { value: 2, message: 'Minimum 2 characters' },
                maxLength: { value: 80, message: 'Maximum 80 characters' },
              })}
              className="w-full bg-surface-secondary border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-energy-green transition-colors"
            />
            {errors.name && (
              <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.name.message}
              </p>
            )}
          </div>

          {/* Duration in Minutes */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-medium text-text-secondary flex items-center gap-1">
                <Clock size={13} className="text-text-muted" />
                Duration (minutes) *
              </label>
              <span className="text-[11px] text-text-muted">Must be in 15-min increments</span>
            </div>
            <input
              type="number"
              step="15"
              min="15"
              max="1440"
              {...register('duration_minutes', {
                required: 'Duration is required',
                min: { value: 15, message: 'Minimum duration is 15 minutes' },
                max: { value: 1440, message: 'Maximum duration is 24 hours (1440m)' },
                validate: (v) => v % 15 === 0 || 'Must be a multiple of 15 minutes',
              })}
              className="w-full bg-surface-secondary border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-energy-green transition-colors"
            />
            {/* Quick selector buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {quickDurations.map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setValue('duration_minutes', d)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-surface border border-surface-border hover:border-energy-green/50 text-text-secondary hover:text-text-primary transition-colors"
                >
                  {d >= 60 ? `${d / 60}h` : `${d}m`}
                </button>
              ))}
            </div>
            {errors.duration_minutes && (
              <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.duration_minutes.message}
              </p>
            )}
          </div>

          {/* Grid row: Power & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Power Watts */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                <Zap size={13} className="text-energy-green" />
                Estimated Power (Watts) *
              </label>
              <input
                type="number"
                step="10"
                min="10"
                {...register('power_watts', {
                  required: 'Power rating is required',
                  min: { value: 1, message: 'Power must be greater than 0' },
                })}
                className="w-full bg-surface-secondary border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-energy-green transition-colors"
              />
              {errors.power_watts && (
                <p className="text-rose-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.power_watts.message}
                </p>
              )}
            </div>

            {/* Deadline Time */}
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
                <Clock size={13} className="text-text-muted" />
                Deadline Time (HH:MM) *
              </label>
              <input
                type="time"
                {...register('deadlineTime', { required: 'Deadline time is required' })}
                className="w-full bg-surface-secondary border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-energy-green transition-colors"
              />
            </div>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1 flex items-center gap-1">
              <Flag size={13} className="text-amber-400" />
              Scheduling Priority (Tie-break Rule)
            </label>
            <select
              {...register('priority', { valueAsNumber: true })}
              className="w-full bg-surface-secondary border border-surface-border rounded-xl px-3.5 py-2.5 text-sm text-text-primary focus:outline-none focus:border-energy-green transition-colors"
            >
              <option value={5}>5 — Critical / Highest (Breaks deadline ties first)</option>
              <option value={4}>4 — High Priority</option>
              <option value={3}>3 — Normal / Medium</option>
              <option value={2}>2 — Low Priority</option>
              <option value={1}>1 — Background / Lowest</option>
            </select>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-surface-border mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-btn bg-surface-secondary text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-medium rounded-btn bg-energy-green hover:bg-energy-dim text-slate-950 font-semibold transition-colors disabled:opacity-50 shadow-lg shadow-energy-green/20"
            >
              {isSubmitting ? 'Adding...' : 'Add Workload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
