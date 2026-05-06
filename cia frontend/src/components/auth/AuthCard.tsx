import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface AuthCardProps {
  children: ReactNode
  className?: string
  eyebrow?: string
  title?: string
  subtitle?: string
  isSuccess?: boolean
  footer?: ReactNode
}

export function AuthCard({ 
  children, 
  className = '',
  eyebrow,
  title,
  subtitle,
  isSuccess,
  footer 
}: AuthCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={`w-full max-w-md ${className}`}
    >
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold tracking-widest text-cyan-400 uppercase">
          {eyebrow}
        </p>
      )}
      {title && (
        <h1 className="mb-1 text-2xl font-bold text-slate-50">
          {title}
        </h1>
      )}
      {subtitle && (
        <p className="mb-6 text-sm text-slate-400">
          {subtitle}
        </p>
      )}
      {isSuccess && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 rounded-xl border border-emerald-400/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200"
        >
          Login successful! Redirecting...
        </motion.div>
      )}
      {children}
      {footer && (
        <div className="mt-6 text-sm text-slate-400">
          {footer}
        </div>
      )}
    </motion.div>
  )
}