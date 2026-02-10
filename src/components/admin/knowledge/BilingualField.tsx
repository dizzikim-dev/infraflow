'use client';

/**
 * 한/영 이중 입력 필드 컴포넌트
 *
 * 영문과 한국어 값을 나란히 입력받는 필드 쌍
 */

interface BilingualFieldProps {
  label: string;
  valueEn: string;
  valueKo: string;
  onChangeEn: (value: string) => void;
  onChangeKo: (value: string) => void;
  type?: 'input' | 'textarea';
  required?: boolean;
}

export default function BilingualField({
  label,
  valueEn,
  valueKo,
  onChangeEn,
  onChangeKo,
  type = 'input',
  required = false,
}: BilingualFieldProps) {
  const inputClasses =
    'w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 영문 필드 */}
        <div>
          <span className="block text-xs text-gray-500 mb-1">영문</span>
          {type === 'textarea' ? (
            <textarea
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="English"
            />
          ) : (
            <input
              type="text"
              value={valueEn}
              onChange={(e) => onChangeEn(e.target.value)}
              className={inputClasses}
              placeholder="English"
            />
          )}
        </div>

        {/* 한국어 필드 */}
        <div>
          <span className="block text-xs text-gray-500 mb-1">한국어</span>
          {type === 'textarea' ? (
            <textarea
              value={valueKo}
              onChange={(e) => onChangeKo(e.target.value)}
              rows={3}
              className={inputClasses}
              placeholder="한국어"
            />
          ) : (
            <input
              type="text"
              value={valueKo}
              onChange={(e) => onChangeKo(e.target.value)}
              className={inputClasses}
              placeholder="한국어"
            />
          )}
        </div>
      </div>
    </div>
  );
}
