'use client'

interface EmailInputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  required?: boolean
  name?: string
  id?: string
  className?: string
}

export default function EmailInput({
  value, onChange, placeholder = 'Enter email address',
  required, name, id, className
}: EmailInputProps) {
  const inputClass = className || 'w-full py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#1B3D2F]/30 focus:border-[#1B3D2F] outline-none'

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>
      <input
        type="email"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        name={name}
        id={id}
        className={`pl-10 ${inputClass}`}
      />
    </div>
  )
}
