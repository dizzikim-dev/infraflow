/**
 * AvailabilityStep — Availability requirements step for the Requirements Wizard.
 */

import type { AvailabilityTarget } from '@/lib/consulting/types';
import {
  type StepFormProps,
  AVAILABILITY_OPTIONS,
  FieldLabel,
  ErrorMessage,
} from './types';

export function AvailabilityStep({ form, errors, onChange }: StepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Availability Target" ko="가용성 목표" />
        <select
          value={form.availabilityTarget}
          onChange={(e) => onChange({ availabilityTarget: Number(e.target.value) as AvailabilityTarget })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {AVAILABILITY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.availabilityTarget} />
      </div>
      <div>
        <FieldLabel en="Max Latency (ms)" ko="최대 지연시간 (ms)" />
        <input
          type="number"
          min={0}
          value={form.maxLatencyMs ?? ''}
          onChange={(e) => onChange({ maxLatencyMs: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g. 200 (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="RPO (minutes)" ko="RPO (분)" />
        <input
          type="number"
          min={0}
          value={form.rpoMinutes ?? ''}
          onChange={(e) => onChange({ rpoMinutes: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Recovery Point Objective (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="RTO (minutes)" ko="RTO (분)" />
        <input
          type="number"
          min={0}
          value={form.rtoMinutes ?? ''}
          onChange={(e) => onChange({ rtoMinutes: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="Recovery Time Objective (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
    </div>
  );
}
