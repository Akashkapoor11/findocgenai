import { useState } from 'react'
import { ChevronDown, ChevronUp, Filter } from 'lucide-react'

const CATEGORY_COLORS = {
  repayment: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20', label: 'Repayment' },
  fees: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', label: 'Fees' },
  default: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', label: 'Default' },
  prepayment: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20', label: 'Prepayment' },
  insurance: { bg: 'bg-teal-500/10', text: 'text-teal-400', border: 'border-teal-500/20', label: 'Insurance' },
  legal: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20', label: 'Legal' },
  other: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/20', label: 'Other' },
}

const IMPORTANCE_BADGE = {
  high: 'badge-high',
  medium: 'badge-medium',
  low: 'badge-low',
}

function ClauseCard({ clause, index }) {
  const [expanded, setExpanded] = useState(false)
  const cat = CATEGORY_COLORS[clause.category] || CATEGORY_COLORS.other

  return (
    <div
      className={`clause-item border rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer
        ${expanded ? 'border-gold-500/30 bg-[#0d1428]' : 'border-[#1e2d52] bg-[#090e1e] hover:bg-[#0d1428]'}`}
      onClick={() => setExpanded(e => !e)}
    >
      <div className="px-5 py-4 flex items-center gap-4">
        {/* Index */}
        <div className={`w-8 h-8 rounded-xl ${cat.bg} border ${cat.border} flex items-center justify-center flex-shrink-0`}>
          <span className={`text-xs font-mono font-bold ${cat.text}`}>{String(index + 1).padStart(2, '0')}</span>
        </div>

        {/* Title and badges */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-semibold text-white text-sm">{clause.title}</h4>
            <span className={`${cat.bg} ${cat.text} border ${cat.border} text-xs font-medium px-2 py-0.5 rounded-full`}>
              {cat.label}
            </span>
            <span className={IMPORTANCE_BADGE[clause.importance] || IMPORTANCE_BADGE.medium}>
              {clause.importance?.charAt(0).toUpperCase() + clause.importance?.slice(1)} Priority
            </span>
          </div>
          {!expanded && (
            <p className="text-slate-500 text-xs mt-1 truncate">{clause.plain_english}</p>
          )}
        </div>

        {/* Toggle */}
        <div className={`flex-shrink-0 transition-colors ${expanded ? 'text-gold-400' : 'text-slate-600'}`}>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-[#1e2d52]">
          <div className="pt-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">Plain English Explanation</p>
            <p className="text-slate-200 text-sm leading-relaxed">{clause.plain_english}</p>
          </div>
          {clause.borrower_impact && (
            <div className="bg-gold-500/5 border border-gold-500/15 rounded-xl p-4">
              <p className="text-xs font-medium text-gold-500 uppercase tracking-wider mb-1.5">💼 What This Means For You</p>
              <p className="text-slate-300 text-sm leading-relaxed">{clause.borrower_impact}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ClauseBreakdown({ clauses }) {
  const [filter, setFilter] = useState('all')

  const categories = ['all', ...new Set(clauses.map(c => c.category).filter(Boolean))]
  const filtered = filter === 'all' ? clauses : clauses.filter(c => c.category === filter)
  const highCount = clauses.filter(c => c.importance === 'high').length

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Clauses', value: clauses.length, color: 'text-white' },
          { label: 'High Priority', value: highCount, color: 'text-red-400' },
          { label: 'Categories', value: categories.length - 1, color: 'text-gold-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card text-center">
            <div className={`text-3xl font-display font-bold ${color}`}>{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        <Filter className="w-4 h-4 text-slate-500" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 capitalize ${
              filter === cat
                ? 'bg-gold-500/15 text-gold-400 border border-gold-500/30'
                : 'bg-[#0d1428] text-slate-400 border border-[#1e2d52] hover:border-slate-500'
            }`}
          >
            {cat === 'all' ? `All (${clauses.length})` : CATEGORY_COLORS[cat]?.label || cat}
          </button>
        ))}
      </div>

      {/* Clauses list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((clause, i) => (
            <ClauseCard key={clause.id || i} clause={clause} index={i} />
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <p className="text-slate-400">No clauses found for this category.</p>
        </div>
      )}

      <p className="text-center text-slate-600 text-xs">
        Click any clause to expand the full plain-language explanation
      </p>
    </div>
  )
}
