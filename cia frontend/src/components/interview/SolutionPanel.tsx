import { motion } from 'framer-motion'

interface SolutionPanelProps {
  solution: string
  onClose: () => void
  isSolutionLoading: boolean
  solutionError: string
}

export function SolutionPanel({ 
  solution,
  onClose,
  isSolutionLoading,
  solutionError,
}: SolutionPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel rounded-2xl overflow-hidden"
    >
      <div className="p-4 border-b border-slate-700/70 bg-slate-900/80 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-100">Solution</h3>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-200 transition"
        >
          ✕
        </button>
      </div>
      
      <div className="p-4 bg-slate-950/50">
        {isSolutionLoading ? (
          <div className="flex items-center gap-3 text-slate-400">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-400 border-t-transparent"></div>
            <span>Generating solution...</span>
          </div>
        ) : solutionError ? (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
            {solutionError}
          </div>
        ) : solution ? (
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-200 bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 overflow-auto max-h-[500px]">
            {solution}
          </pre>
        ) : (
          <p className="text-slate-400 text-sm">No solution available yet.</p>
        )}
      </div>
    </motion.div>
  )
}