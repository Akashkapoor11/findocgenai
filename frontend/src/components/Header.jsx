import { FileText, RotateCcw, Github } from 'lucide-react'

export default function Header({ onReset }) {
  return (
    <header className="relative z-20 border-b border-[#1e2d52]/60 backdrop-blur-sm bg-[#050813]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-gold-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <FileText className="w-5 h-5 text-navy-950" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display font-bold text-xl text-white tracking-tight">
                FinDoc<span className="text-gold-400">Gen</span>AI
              </span>
              <div className="text-[10px] text-slate-500 -mt-0.5 font-mono tracking-widest uppercase">
                ET GenAI Hackathon 2026
              </div>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm"
            >
              <Github className="w-4 h-4" />
              <span>GitHub</span>
            </a>

            {onReset && (
              <button
                onClick={onReset}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span className="hidden sm:inline">New Document</span>
              </button>
            )}

            <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-emerald-400 text-xs font-medium">AI Ready</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
