import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const PasswordInput = ({
  value,
  onChange,
  placeholder = '••••••••',
  id,
  required = false,
  className = '',
  autoComplete = 'current-password',
}) => {
  const [visible, setVisible] = useState(false)

  return (
    <div className={`relative ${className}`}>
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className="w-full bg-raw-surface border-[3px] border-raw-border font-mono text-[15px] pl-3 pr-11 py-2.5 text-raw-text
                   focus:outline-none focus:border-[5px] placeholder:text-raw-text-tertiary"
        style={{ borderRadius: 0 }}
        autoComplete={autoComplete}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-raw-text-secondary hover:text-raw-text transition-colors"
        aria-label={visible ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        {visible ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
      </button>
    </div>
  )
}

export default PasswordInput
