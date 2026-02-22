/**
 * BudgetStep — Budget constraints step for the Requirements Wizard.
 */

import type { BudgetRange } from '@/lib/consulting/types';
import {
  type StepFormProps,
  BUDGET_RANGE_OPTIONS,
  FieldLabel,
  ErrorMessage,
} from './types';

export function BudgetStep({ form, errors, onChange }: StepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Budget Range" ko="예산 범위" />
        <select
          value={form.budgetRange}
          onChange={(e) => onChange({ budgetRange: e.target.value as BudgetRange })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {BUDGET_RANGE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.budgetRange} />
      </div>
      <div>
        <FieldLabel en="Monthly Budget (USD)" ko="월 예산 (USD)" />
        <input
          type="number"
          min={0}
          value={form.monthlyBudgetUsd ?? ''}
          onChange={(e) => onChange({ monthlyBudgetUsd: e.target.value ? Number(e.target.value) : undefined })}
          placeholder="e.g. 15000 (optional)"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
    </div>
  );
}
