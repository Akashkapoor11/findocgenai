import { DollarSign, Percent, Calendar, CreditCard, AlertCircle, TrendingUp, CheckCircle, Info } from 'lucide-react'

const METRIC_CONFIG = [
  { key: 'loan_amount', label: 'Loan Amount', icon: DollarSign, color: 'text-gold-400', bg: 'bg-gold-500/10', border: 'border-gold-500/20' },
  { key: 'interest_rate', label: 'Interest Rate', icon: Percent, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
  { key: 'loan_tenure', label: 'Loan Tenure', icon: Calendar, color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
  { key: 'emi_amount', label: 'Monthly EMI', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  { key: 'processing_fee', label: 'Processing Fee', icon: CreditCard, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
  { key: 'prepayment_penalty', label: 'Prepayment Penalty', icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  { key: 'late_payment_fee', label: 'Late Payment Fee', icon: AlertCircle, color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { key: 'effective_apr', label: 'Effective APR', icon: Percent, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
  { key: 'insurance_required', label: 'Insurance Required', icon: CheckCircle, color: 'text-teal-400', bg: 'bg-teal-500/10', border: 'border-teal-500/20' },
]

function MetricCard({ label, value, icon: Icon, color, bg, border }) {
  if (!value || value === 'null' || value === null) return null
  return (
    <div className={`card hover:border-opacity-50 transition-all duration-300 ${border} hover:scale-[1.02]`}>
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl ${bg} border ${border} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="min-w-0">
          <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</p>
          <p className={`font-display font-bold text-xl ${color} mt-0.5 truncate`}>{value}</p>
        </div>
      </div>
    </div>
  )
}

export default function KeyMetrics({ metrics, advice, issuer }) {
  const validMetrics = metrics
    ? METRIC_CONFIG.filter(m => metrics[m.key] && metrics[m.key] !== 'null' && metrics[m.key] !== null)
    : []

  return (
    <div className="space-y-6">
      {/* Issuer */}
      {issuer && issuer !== 'Not specified' && (
        <div className="flex items-center gap-3 card">
          <div className="w-10 h-10 rounded-xl bg-[#131c38] border border-[#1e2d52] flex items-center justify-center">
            <span className="text-lg">🏦</span>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider">Issuing Institution</p>
            <p className="text-white font-semibold">{issuer}</p>
          </div>
        </div>
      )}

      {/* Metrics grid */}
      {validMetrics.length > 0 ? (
        <>
          <div>
            <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <span className="w-4 h-px bg-gold-500/40" />
              Key Financial Numbers
              <span className="flex-1 h-px bg-[#1e2d52]" />
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {validMetrics.map(m => (
                <MetricCard key={m.key} {...m} value={metrics[m.key]} />
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="card text-center py-10">
          <Info className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No specific financial figures were extracted from this document.</p>
        </div>
      )}

      {/* Borrower advice */}
      {advice && (
        <div className="card border-gold-500/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-gold-500/10 border border-gold-500/20 rounded-lg flex items-center justify-center">
              <span className="text-sm">💡</span>
            </div>
            <h3 className="font-semibold text-white">AI Advice for You</h3>
          </div>
          <div className="space-y-3">
            {typeof advice === 'string'
              ? advice.split('\n').filter(Boolean).map((line, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="w-5 h-5 bg-gold-500/10 text-gold-400 rounded-full flex items-center justify-center text-xs flex-shrink-0 mt-0.5">{i + 1}</span>
                    <p className="text-slate-300 text-sm leading-relaxed">{line.replace(/^[\d\.\-\*]+\s*/, '')}</p>
                  </div>
                ))
              : <p className="text-slate-300 text-sm leading-relaxed">{advice}</p>
            }
          </div>
        </div>
      )}

      {/* What this means section */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          {
            emoji: '📊',
            title: 'Total Interest Outgo',
            desc: 'Use our Q&A tab to ask: "What is my total interest payment over the full tenure?"',
          },
          {
            emoji: '⚠️',
            title: 'Watch Your Rights',
            desc: 'Ask the AI: "What happens if I miss an EMI?" to understand penalty consequences.',
          },
          {
            emoji: '🔍',
            title: 'Hidden Charges',
            desc: 'Check the Risk Report tab for a complete list of hidden and conditional charges.',
          },
        ].map(({ emoji, title, desc }) => (
          <div key={title} className="card hover:border-[#2d3a5e] transition-colors">
            <span className="text-2xl">{emoji}</span>
            <p className="font-semibold text-white text-sm mt-3">{title}</p>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
