import { useEffect, useState } from 'react'

const STEPS = [
  'Extracting text from document',
  'Segmenting clauses',
  'Building AI knowledge index',
  'Analysing with Gemini 2.5 Flash',
  'Generating risk checklist',
  'Finalising your report',
]

export default function ProcessingState({ message }) {
  const [completedSteps, setCompletedSteps] = useState(0)
  const [dots, setDots] = useState('')

  useEffect(() => {
    const idx = STEPS.findIndex(s => message.toLowerCase().includes(s.toLowerCase().split(' ')[0].toLowerCase()))
    if (idx >= 0) setCompletedSteps(idx)
  }, [message])

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(d => d.length >= 3 ? '' : d + '.')
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[70vh] px-4">
      <div className="max-w-md w-full text-center">
        {/* Animated ring */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <svg className="w-full h-full animate-spin-slow" viewBox="0 0 100 100">
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="#1e2d52"
              strokeWidth="4"
            />
            <circle
              cx="50" cy="50" r="42"
              fill="none"
              stroke="url(#goldGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray="100 164"
              strokeDashoffset="0"
            />
            <defs>
              <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#fbbf24" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-14 h-14 bg-gold-500/10 rounded-full flex items-center justify-center">
              <span className="text-2xl">🧠</span>
            </div>
          </div>
        </div>

        <h2 className="font-display text-2xl font-bold text-white mb-2">
          Analysing Document{dots}
        </h2>
        <p className="text-slate-400 text-sm mb-10">
          {message || 'Preparing your analysis…'}
        </p>

        {/* Step progress */}
        <div className="space-y-3 text-left">
          {STEPS.map((step, i) => {
            const done = i < completedSteps
            const active = i === completedSteps
            return (
              <div
                key={step}
                className={`flex items-center gap-3 rounded-xl px-4 py-2.5 transition-all duration-500 ${
                  active ? 'bg-gold-500/10 border border-gold-500/20' :
                  done ? 'opacity-60' : 'opacity-30'
                }`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 text-xs transition-all duration-300 ${
                  done ? 'bg-emerald-500/20 text-emerald-400' :
                  active ? 'bg-gold-500/20 text-gold-400 animate-pulse' :
                  'bg-[#1e2d52] text-slate-600'
                }`}>
                  {done ? '✓' : active ? '⟳' : '·'}
                </div>
                <span className={`text-sm ${active ? 'text-gold-300 font-medium' : done ? 'text-slate-400' : 'text-slate-600'}`}>
                  {step}
                </span>
              </div>
            )
          })}
        </div>

        <p className="text-slate-600 text-xs mt-8">
          This usually takes 15–30 seconds depending on document length
        </p>
      </div>
    </div>
  )
}
