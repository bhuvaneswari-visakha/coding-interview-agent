import { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
  label?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, label, className = '', ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-slate-300">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={`w-full px-4 py-3 rounded-lg border ${
            error 
              ? 'border-red-400/50 focus:ring-2 focus:ring-red-500/50' 
              : 'border-slate-600 bg-slate-800/50 text-slate-100 focus:ring-2 focus:ring-cyan-500/50'
          } focus:border-transparent outline-none transition-all duration-200 placeholder:text-slate-500 ${className}`}
          {...props}
        />
        {error && <p className="text-sm text-rose-400">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'