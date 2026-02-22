/**
 * SecurityStep — Security requirements step for the Requirements Wizard.
 */

import { CheckCircle2 } from 'lucide-react';
import type { ConsultingSecurityLevel } from '@/lib/consulting/types';
import {
  type StepFormProps,
  SECURITY_LEVEL_OPTIONS,
  COMPLIANCE_FRAMEWORKS,
  FieldLabel,
  ErrorMessage,
} from './types';

export function SecurityStep({ form, errors, onChange }: StepFormProps) {
  const toggleFramework = (fw: string) => {
    const current = form.complianceFrameworks;
    const next = current.includes(fw)
      ? current.filter((f) => f !== fw)
      : [...current, fw];
    onChange({ complianceFrameworks: next });
  };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel en="Security Level" ko="보안 등급" />
        <select
          value={form.securityLevel}
          onChange={(e) => onChange({ securityLevel: e.target.value as ConsultingSecurityLevel })}
          className="w-full px-3 py-2 bg-zinc-800/60 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-green-500/50"
        >
          {SECURITY_LEVEL_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.en} ({o.ko})
            </option>
          ))}
        </select>
        <ErrorMessage message={errors.securityLevel} />
      </div>
      <div>
        <FieldLabel en="Compliance Frameworks" ko="컴플라이언스 프레임워크" />
        <div className="grid grid-cols-2 gap-2 mt-1">
          {COMPLIANCE_FRAMEWORKS.map((fw) => (
            <label
              key={fw.value}
              className={`flex items-center gap-2 p-2.5 rounded-lg border cursor-pointer transition-colors text-sm ${
                form.complianceFrameworks.includes(fw.value)
                  ? 'bg-green-500/10 border-green-500/30 text-green-300'
                  : 'bg-zinc-800/50 border-white/5 text-zinc-400 hover:bg-zinc-700/50'
              }`}
            >
              <input
                type="checkbox"
                checked={form.complianceFrameworks.includes(fw.value)}
                onChange={() => toggleFramework(fw.value)}
                className="sr-only"
              />
              <div
                className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                  form.complianceFrameworks.includes(fw.value)
                    ? 'bg-green-500 border-green-500'
                    : 'border-zinc-600'
                }`}
              >
                {form.complianceFrameworks.includes(fw.value) && (
                  <CheckCircle2 className="w-3 h-3 text-white" />
                )}
              </div>
              {fw.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
