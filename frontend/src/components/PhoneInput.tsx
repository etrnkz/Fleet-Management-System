'use client'

export const COUNTRY_CODES = [
  { code: '+251', flag: '🇪🇹', name: 'Ethiopia' },
  { code: '+1',   flag: '🇺🇸', name: 'USA/Canada' },
  { code: '+44',  flag: '🇬🇧', name: 'UK' },
  { code: '+49',  flag: '🇩🇪', name: 'Germany' },
  { code: '+33',  flag: '🇫🇷', name: 'France' },
  { code: '+254', flag: '🇰🇪', name: 'Kenya' },
  { code: '+256', flag: '🇺🇬', name: 'Uganda' },
  { code: '+255', flag: '🇹🇿', name: 'Tanzania' },
  { code: '+20',  flag: '🇪🇬', name: 'Egypt' },
  { code: '+27',  flag: '🇿🇦', name: 'South Africa' },
  { code: '+234', flag: '🇳🇬', name: 'Nigeria' },
  { code: '+91',  flag: '🇮🇳', name: 'India' },
  { code: '+971', flag: '🇦🇪', name: 'UAE' },
]

const RULES: Record<string, { min: number; max: number; pattern?: RegExp; msg: string }> = {
  '+251': { min: 9,  max: 9,  pattern: /^[917]/, msg: 'Ethiopian numbers must start with 9, 7, or 1 and be exactly 9 digits' },
  '+1':   { min: 10, max: 10, pattern: /^[2-9]/, msg: 'US/Canada numbers must be exactly 10 digits and not start with 0 or 1' },
  '+44':  { min: 10, max: 10, pattern: /^[1-9]/, msg: 'UK numbers must be exactly 10 digits' },
  '+49':  { min: 10, max: 11,                    msg: 'German numbers must be 10–11 digits' },
  '+33':  { min: 9,  max: 9,  pattern: /^[1-9]/, msg: 'French numbers must be exactly 9 digits' },
  '+254': { min: 9,  max: 9,  pattern: /^[17]/,  msg: 'Kenyan numbers must start with 7 or 1 and be exactly 9 digits' },
  '+256': { min: 9,  max: 9,  pattern: /^[37]/,  msg: 'Ugandan numbers must start with 3 or 7 and be exactly 9 digits' },
  '+255': { min: 9,  max: 9,  pattern: /^[67]/,  msg: 'Tanzanian numbers must start with 6 or 7 and be exactly 9 digits' },
  '+20':  { min: 10, max: 10, pattern: /^[1]/,   msg: 'Egyptian numbers must start with 1 and be exactly 10 digits' },
  '+27':  { min: 9,  max: 9,  pattern: /^[6-8]/, msg: 'South African numbers must start with 6, 7, or 8 and be exactly 9 digits' },
  '+234': { min: 10, max: 10, pattern: /^[7-9]/, msg: 'Nigerian numbers must start with 7, 8, or 9 and be exactly 10 digits' },
  '+91':  { min: 10, max: 10, pattern: /^[6-9]/, msg: 'Indian numbers must start with 6–9 and be exactly 10 digits' },
  '+971': { min: 9,  max: 9,  pattern: /^[5]/,   msg: 'UAE mobile numbers must start with 5 and be exactly 9 digits' },
}

export function validatePhone(code: string, number: string): string {
  const digits = number.replace(/\D/g, '')
  if (!digits) return ''
  const rule = RULES[code]
  if (!rule) {
    if (digits.length < 7) return 'Too short — minimum 7 digits'
    if (digits.length > 12) return 'Too long — maximum 12 digits'
    return ''
  }
  if (digits.length < rule.min || digits.length > rule.max) return rule.msg
  if (rule.pattern && !rule.pattern.test(digits)) return rule.msg
  return ''
}

interface PhoneInputProps {
  id?: string
  label: string
  required?: boolean
  code: string
  number: string
  error: string
  onCodeChange: (c: string) => void
  onNumberChange: (n: string) => void
  /** Extra CSS classes for the wrapper div */
  className?: string
}

export default function PhoneInput({
  id, label, required, code, number, error, onCodeChange, onNumberChange, className = '',
}: PhoneInputProps) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex gap-2">
        <select
          value={code}
          onChange={e => onCodeChange(e.target.value)}
          className="w-36 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm bg-white"
        >
          {COUNTRY_CODES.map(c => (
            <option key={c.code} value={c.code}>{c.flag} {c.code} {c.name}</option>
          ))}
        </select>
        <div className="flex-1 relative">
          <input
            type="tel"
            id={id}
            value={number}
            required={required}
            placeholder={code === '+251' ? '912345678' : code === '+1' ? '2025551234' : '...'}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none text-sm transition-all ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            onChange={e => onNumberChange(e.target.value.replace(/[^\d\s\-()]/g, ''))}
          />
          {number && !error && (
            <svg className="w-4 h-4 text-green-500 absolute right-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )}
        </div>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
          {error}
        </p>
      )}
      {number && !error && (
        <p className="mt-1 text-xs text-gray-400">Full: {code}{number.replace(/\D/g, '')}</p>
      )}
    </div>
  )
}
