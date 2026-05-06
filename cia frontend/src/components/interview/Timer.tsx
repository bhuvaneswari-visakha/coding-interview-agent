import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface TimerProps {
  totalSeconds?: number
  elapsedSeconds?: number
  initialMinutes?: number
  onTimeUp?: () => void
  onExpire?: () => void
  onTick?: (elapsed: number) => void
  isPaused?: boolean
}

export function Timer({ 
  totalSeconds, 
  elapsedSeconds = 0, 
  initialMinutes, 
  onTimeUp, 
  onExpire,
  onTick,
  isPaused = false 
}: TimerProps) {
  // Support both old API (initialMinutes) and new API (totalSeconds/elapsedSeconds)
  const total = totalSeconds ?? (initialMinutes ? initialMinutes * 60 : 0)
  const [elapsed, setElapsed] = useState(elapsedSeconds)
  
  const remainingSeconds = Math.max(0, total - elapsed)

  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return
    
    const timer = setInterval(() => {
      setElapsed((e) => {
        const newElapsed = e + 1
        onTick?.(newElapsed)
        
        if (newElapsed >= total) {
          clearInterval(timer)
          onTimeUp?.()
          onExpire?.()
          return total
        }
        return newElapsed
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [isPaused, onTimeUp, onExpire, onTick, total, remainingSeconds])

  const minutes = Math.floor(remainingSeconds / 60)
  const seconds = remainingSeconds % 60
  const isLow = remainingSeconds < 300 // 5 minutes

  return (
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        isLow ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-white'
      }`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span className="font-mono text-lg font-semibold">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </motion.div>
  )
}