import { motion } from 'framer-motion'
import type { CodeExecutionStatus, RunCodeResponse } from '../../types/interview'

interface OutputConsoleProps {
  output: RunCodeResponse | null
  status: CodeExecutionStatus
}

export function OutputConsole({ output, status }: OutputConsoleProps) {
  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="bg-slate-900/80 px-4 py-2 border-b border-slate-700/70">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Output</span>
          {status !== 'idle' && (
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              status === 'running' 
                ? 'bg-blue-500/20 text-blue-300'
                : status === 'success'
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-rose-500/20 text-rose-300'
            }`}>
              {status === 'running' ? 'Running...' : status === 'success' ? 'Success' : 'Error'}
            </span>
          )}
        </div>
      </div>
      
      <div className="p-4 font-mono text-sm min-h-[200px] max-h-[400px] overflow-auto bg-slate-950/50">
        {!output ? (
          <span className="text-slate-500">Run your code to see output...</span>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3"
          >
            <div className={`whitespace-pre-wrap ${
              output.status === 'success' ? 'text-emerald-300' : 'text-rose-300'
            }`}>
              {output.output}
            </div>

            {output.comparisons && output.comparisons.length > 0 && (
              <div className="mt-4 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Test Cases:</div>
                {output.comparisons.map((comparison, i) => (
                  <div
                    key={i}
                    className={`p-3 rounded-lg border ${
                      comparison.passed
                        ? 'border-emerald-500/30 bg-emerald-500/10'
                        : 'border-rose-500/30 bg-rose-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-300">
                        Test Case {i + 1}
                      </span>
                      <span className={`text-xs font-bold ${
                        comparison.passed ? 'text-emerald-300' : 'text-rose-300'
                      }`}>
                        {comparison.passed ? '✓ PASSED' : '✗ FAILED'}
                      </span>
                    </div>
                    
                    {comparison.testcaseInput && (
                      <div className="text-xs text-slate-400 mb-1">
                        <span className="font-semibold">Input:</span> {comparison.testcaseInput}
                      </div>
                    )}
                    
                    <div className="text-xs text-slate-400 mb-1">
                      <span className="font-semibold">Expected:</span> {comparison.expectedOutput}
                    </div>
                    
                    <div className="text-xs text-slate-400">
                      <span className="font-semibold">Got:</span> {comparison.actualOutput}
                    </div>

                    {comparison.error && (
                      <div className="mt-2 text-xs text-rose-300">
                        <span className="font-semibold">Error:</span> {comparison.error}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}