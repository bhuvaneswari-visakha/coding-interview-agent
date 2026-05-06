import { motion } from 'framer-motion'
import type { InterviewQuestion } from '../../types/interview'

interface QuestionPanelProps {
  question: InterviewQuestion
  attempts: number
  isHintEnabled: boolean
  isHintVisible: boolean
  isSolutionVisible: boolean
  onToggleHint: () => void
  onToggleSolution: () => void
}

export function QuestionPanel({ 
  question,
  attempts,
  isHintEnabled,
  isHintVisible,
  isSolutionVisible,
  onToggleHint,
  onToggleSolution,
}: QuestionPanelProps) {
  // Defensive check
  if (!question) {
    return (
      <div className="glass-panel h-full flex items-center justify-center rounded-2xl p-8">
        <p className="text-slate-400">Loading question...</p>
      </div>
    )
  }

  return (
    <div className="glass-panel h-full flex flex-col rounded-2xl overflow-hidden">
      <div className="p-4 border-b border-slate-700/70 bg-slate-900/80">
        <div className="flex items-center gap-2 mb-2">
          <span className={`px-2 py-1 text-xs font-semibold rounded ${
            question.difficulty === 'Easy' 
              ? 'bg-emerald-500/20 text-emerald-300' 
              : question.difficulty === 'Medium'
              ? 'bg-amber-500/20 text-amber-300'
              : 'bg-rose-500/20 text-rose-300'
          }`}>
            {question.difficulty || 'Medium'}
          </span>
          {question.tags && question.tags.length > 0 && question.tags.map((tag, i) => (
            <span key={i} className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded">
              {tag}
            </span>
          ))}
        </div>
        <h2 className="text-lg font-semibold text-slate-100">{question.title || 'Untitled Question'}</h2>
        <p className="text-xs text-slate-400 mt-1">Attempts: {attempts || 0}</p>
      </div>
      
      <div className="flex-1 p-4 overflow-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="prose prose-sm max-w-none prose-invert"
        >
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-slate-200 mb-2">Problem Statement</h3>
            <p className="text-slate-300 whitespace-pre-wrap">{question.statement || 'No problem statement available.'}</p>
          </div>
          
          {question.examples && question.examples.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Examples:</h3>
              {question.examples.map((example, i) => (
                <div key={i} className="mt-2 p-3 bg-slate-800/50 rounded-lg border border-slate-700/50">
                  <p className="text-sm text-slate-300"><strong>Input:</strong> {example.input || 'N/A'}</p>
                  <p className="text-sm text-slate-300"><strong>Output:</strong> {example.output || 'N/A'}</p>
                  {example.explanation && (
                    <p className="text-sm text-slate-400 mt-1">{example.explanation}</p>
                  )}
                </div>
              ))}
            </div>
          )}
          
          {question.constraints && question.constraints.length > 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2">Constraints:</h3>
              <ul className="list-disc list-inside text-sm text-slate-300 space-y-1">
                {question.constraints.map((constraint, i) => (
                  <li key={i}>{constraint}</li>
                ))}
              </ul>
            </div>
          )}

          {isHintEnabled && (
            <div className="mb-4">
              <button
                onClick={onToggleHint}
                className="w-full text-left px-3 py-2 rounded-lg border border-cyan-500/40 bg-cyan-500/10 text-cyan-200 text-sm font-semibold hover:bg-cyan-500/20 transition"
              >
                {isHintVisible ? '🔽 Hide Hint' : '💡 Show Hint'}
              </button>
              {isHintVisible && question.hint && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="mt-2 p-3 bg-cyan-900/20 rounded-lg border border-cyan-500/30"
                >
                  <p className="text-sm text-cyan-100">{question.hint}</p>
                </motion.div>
              )}
            </div>
          )}

          {attempts >= 3 && (
            <div className="mb-4">
              <button
                onClick={onToggleSolution}
                className="w-full text-left px-3 py-2 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-200 text-sm font-semibold hover:bg-purple-500/20 transition"
              >
                {isSolutionVisible ? '🔽 Hide Solution' : '📝 Show Solution'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}