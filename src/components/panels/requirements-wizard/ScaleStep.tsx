/**
 * ScaleStep — Scale/sizing step for the Requirements Wizard.
 */

import type { DataVolume, TrafficPattern } from '@/lib/consulting/types';
import {
  type StepFormProps,
  DATA_VOLUME_OPTIONS,
  TRAFFIC_PATTERN_OPTIONS,
  FieldLabel,
  ErrorMessage,
} from './types';

export function ScaleStep({ form, errors, onChange }: StepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Total Users" ko="전체 사용자 수" />
        <input
          type="number"
          min={1}
          value={form.userCount || ''}
          onChange={(e) => onChange({ userCount: Number(e.target.value) || 0 })}
          placeholder="e.g. 10000"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
        <ErrorMessage message={errors.userCount} />
      </div>
      <div>
        <FieldLabel en="Concurrent Users" ko="동시 접속자 수" />
        <input
          type="number"
          min={1}
          value={form.concurrentUsers || ''}
          onChange={(e) => onChange({ concurrentUsers: Number(e.target.value) || 0 })}
          placeholder="e.g. 1000"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
        <ErrorMessage message={errors.concurrentUsers} />
      </div>
      <div>
        <FieldLabel en="Data Volume" ko="데이터 규모" />
        <select
          value={form.dataVolume}
          onChange={(e) => onChange({ dataVolume: e.target.value as DataVolume })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {DATA_VOLUME_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel en="Traffic Pattern" ko="트래픽 패턴" />
        <select
          value={form.trafficPattern}
          onChange={(e) => onChange({ trafficPattern: e.target.value as TrafficPattern })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {TRAFFIC_PATTERN_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
