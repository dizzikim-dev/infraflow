/**
 * OrgStep — Organization info step for the Requirements Wizard.
 */

import type { OrganizationSize, IndustryType } from '@/lib/consulting/types';
import {
  type StepFormProps,
  ORG_SIZE_OPTIONS,
  INDUSTRY_OPTIONS,
  FieldLabel,
  ErrorMessage,
} from './types';

export function OrgStep({ form, errors, onChange }: StepFormProps) {
  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Organization Name" ko="조직명" />
        <input
          type="text"
          value={form.organizationName ?? ''}
          onChange={(e) => onChange({ organizationName: e.target.value })}
          placeholder="e.g. Acme Corp"
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-green-500/50"
        />
      </div>
      <div>
        <FieldLabel en="Organization Size" ko="조직 규모" />
        <select
          value={form.organizationSize}
          onChange={(e) => onChange({ organizationSize: e.target.value as OrganizationSize })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {ORG_SIZE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.organizationSize} />
      </div>
      <div>
        <FieldLabel en="Industry" ko="업종" />
        <select
          value={form.industry}
          onChange={(e) => onChange({ industry: e.target.value as IndustryType })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {INDUSTRY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.industry} />
      </div>
    </div>
  );
}
