/**
 * PreferencesStep — Vendor/tech preferences step for the Requirements Wizard.
 */

import { CheckCircle2 } from 'lucide-react';
import type { ConsultingRequirements, CloudPreference } from '@/lib/consulting/types';
import type { NodeCategory } from '@/types/infra';
import {
  type StepFormProps,
  CLOUD_PREFERENCE_OPTIONS,
  VENDOR_OPTIONS,
  INFRA_CATEGORY_OPTIONS,
  FieldLabel,
} from './types';

export function PreferencesStep({ form, onChange }: StepFormProps) {
  const toggleVendor = (v: string) => {
    const current = form.preferredVendors ?? [];
    const next = current.includes(v) ? current.filter((x) => x !== v) : [...current, v];
    onChange({ preferredVendors: next });
  };

  const toggleCategory = (cat: NodeCategory) => {
    // We store categories as strings in existingInfrastructure for simplicity
    const current = (form.existingInfrastructure ?? []) as string[];
    const next = current.includes(cat)
      ? current.filter((x) => x !== cat)
      : [...current, cat];
    onChange({ existingInfrastructure: next as ConsultingRequirements['existingInfrastructure'] });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Cloud Preference" ko="클라우드 선호" />
        <select
          value={form.cloudPreference}
          onChange={(e) => onChange({ cloudPreference: e.target.value as CloudPreference })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {CLOUD_PREFERENCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
      </div>
      <div>
        <FieldLabel en="Preferred Vendors" ko="선호 벤더" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {VENDOR_OPTIONS.map((v) => (
            <label
              key={v.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                (form.preferredVendors ?? []).includes(v.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={(form.preferredVendors ?? []).includes(v.value)}
                onChange={() => toggleVendor(v.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  (form.preferredVendors ?? []).includes(v.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {(form.preferredVendors ?? []).includes(v.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {v.en}
            </label>
          ))}
        </div>
      </div>
      <div>
        <FieldLabel en="Existing Infrastructure" ko="기존 인프라" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {INFRA_CATEGORY_OPTIONS.map((cat) => (
            <label
              key={cat.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                ((form.existingInfrastructure ?? []) as string[]).includes(cat.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={((form.existingInfrastructure ?? []) as string[]).includes(cat.value)}
                onChange={() => toggleCategory(cat.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  ((form.existingInfrastructure ?? []) as string[]).includes(cat.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {((form.existingInfrastructure ?? []) as string[]).includes(cat.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {cat.en} ({cat.ko})
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
