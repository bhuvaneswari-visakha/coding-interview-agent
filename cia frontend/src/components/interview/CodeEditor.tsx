import Editor from '@monaco-editor/react'
import type { ProgrammingLanguage } from '../../types/interview'

interface CodeEditorProps {
  code: string
  language: ProgrammingLanguage
  isRunning: boolean
  isSubmitting: boolean
  isSolved: boolean
  questionScore: number
  totalScore: number
  onCodeChange: (code: string) => void
  onLanguageChange: (language: ProgrammingLanguage) => void
  onRunCode: () => void
  onSubmitCode: () => void
}

const LANGUAGE_MAP: Record<ProgrammingLanguage, string> = {
  typescript: 'typescript',
  javascript: 'javascript',
  python: 'python',
  java: 'java',
}

export function CodeEditor({ 
  code,
  language,
  isRunning,
  isSubmitting,
  isSolved,
  questionScore,
  onCodeChange,
  onLanguageChange,
  onRunCode,
  onSubmitCode,
}: CodeEditorProps) {
  const handleEditorChange = (value: string | undefined) => {
    onCodeChange(value || '')
  }

  return (
    <div className="glass-panel rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between p-3 border-b border-slate-700/70 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <select
            value={language}
            onChange={(e) => onLanguageChange(e.target.value as ProgrammingLanguage)}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            disabled={isRunning || isSubmitting}
          >
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="java">Java</option>
          </select>
          
          <div className="text-xs text-slate-400">
            Score: <span className="font-semibold text-cyan-300">{questionScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRunCode}
            disabled={isRunning || isSubmitting}
            className="rounded-lg border border-slate-600 bg-slate-800 px-3 py-1.5 text-sm font-semibold text-slate-200 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
          <button
            onClick={onSubmitCode}
            disabled={isRunning || isSubmitting || isSolved}
            className="rounded-lg border border-cyan-500/60 bg-cyan-500/15 px-3 py-1.5 text-sm font-semibold text-cyan-100 hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : isSolved ? 'Solved ✓' : 'Submit'}
          </button>
        </div>
      </div>

      <div className="h-[500px]">
        <Editor
          height="100%"
          language={LANGUAGE_MAP[language]}
          value={code}
          onChange={handleEditorChange}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            readOnly: isRunning || isSubmitting,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
          }}
        />
      </div>
    </div>
  )
}