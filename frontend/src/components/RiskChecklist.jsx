import { AlertTriangle, AlertCircle, Info, IndianRupee, CheckSquare, XCircle } from 'lucide-react'

const SEVERITY_CONFIG = {
  high: {
    icon: XCircle,
    bg: 'bg-red-500/8',
    border: 'border-red-500/25',
    badge: 'badge-high',
    iconColor: 'text-red-400',
    recBg: 'bg-red-500/5 border-red-500/15',
  },
  medium: {
    icon: AlertTriangle,
    bg: 'bg-amber-500/8',
    border: 'border-amber-500/25',
    badge: 'badge-medium',
    iconColor: 'text-amber-400',
    recBg: 'bg-amber-500/5 border-amber-500/15',
  },
  low: {
    icon: Info,
    bg: 'bg-blue-500/8',
    border: 'border-blue-500/25',
    badge: 'badge-low',
    iconColor: 'text-blue-400',
    recBg: 'bg-blue-500/5 border-blue-500/15',
  },
}

function RiskItem({ risk }) {
  const cfg = SEVERITY_CONFIG[risk.severity] || SEVERITY_CONFIG.medium
  const Icon = cfg.icon

  return (
    <div className={`border rounded-2xl p-5 ${cfg.bg} ${cfg.border} transition-all hover:scale-[1.005]`}>
      <div className="flex items-start gap-4">
        <div className={`w-9 h-9 rounded-xl bg-current/10 flex items-center justify-center flex-shrink-0 ${cfg.iconColor}`}
          style={{ background: 'rgba(0,0,0,0.2)' }}
        >
          <Icon className={`w-5 h-5 ${cfg.iconColor}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <h4 className="font-semibold text-white text-sm">{risk.title}</h4>
            <span className={cfg.badge}>
              {risk.severity?.charAt(0).toUpperCase() + risk.severity?.slice(1)} Severity
            </span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">{risk.description}</p>
          {risk.clause_reference && (
            <p className="text-slate-500 text-xs mt-2">
              📌 Ref: <span className="text-slate-400">{risk.clause_reference}</span>
            </p>
          )}
          {risk.recommendation && (
            <div className={`mt-3 rounded-xl p-3 border ${cfg.recBg}`}>
              <p className="text-xs font-medium text-slate-400 mb-1">✅ Recommended Action</p>
              <p className="text-sm text-slate-300">{risk.recommendation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function RiskChecklist({ risks, hiddenCharges, riskScore, riskSummary }) {
  const high = risks.filter(r => r.severity === 'high')
  const medium = risks.filter(r => r.severity === 'medium')
  const low = risks.filter(r => r.severity === 'low')

  const scoreColor = riskScore <= 3 ? 'text-emerald-400' : riskScore <= 6 ? 'text-amber-400' : 'text-red-400'
  const scoreBg = riskScore <= 3 ? 'bg-emerald-500/10 border-emerald-500/20' : riskScore <= 6 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-red-500/10 border-red-500/20'

  return (
    <div className="space-y-6">
      {/* Risk score banner */}
      <div className={`card ${scoreBg} text-center py-6`}>
        <div className={`text-6xl font-display font-bold ${scoreColor}`}>{riskScore}<span className="text-2xl text-slate-500">/10</span></div>
        <p className="text-slate-300 text-sm mt-2">{riskSummary || 'Overall document risk assessment'}</p>
        <div className="flex justify-center gap-6 mt-5">
          <div className="text-center">
            <div className="text-xl font-bold text-red-400">{high.length}</div>
            <div className="text-slate-500 text-xs">High</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-amber-400">{medium.length}</div>
            <div className="text-slate-500 text-xs">Medium</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-blue-400">{low.length}</div>
            <div className="text-slate-500 text-xs">Low</div>
          </div>
        </div>
      </div>

      {/* Risk items by severity */}
      {high.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-red-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <XCircle className="w-3.5 h-3.5" /> High Severity Risks
          </h3>
          <div className="space-y-3">
            {high.map((r, i) => <RiskItem key={i} risk={r} />)}
          </div>
        </section>
      )}

      {medium.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-amber-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium Severity Risks
          </h3>
          <div className="space-y-3">
            {medium.map((r, i) => <RiskItem key={i} risk={r} />)}
          </div>
        </section>
      )}

      {low.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Info className="w-3.5 h-3.5" /> Low Severity Notes
          </h3>
          <div className="space-y-3">
            {low.map((r, i) => <RiskItem key={i} risk={r} />)}
          </div>
        </section>
      )}

      {/* Hidden charges table */}
      {hiddenCharges?.length > 0 && (
        <section>
          <h3 className="text-xs font-medium text-gold-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <IndianRupee className="w-3.5 h-3.5" /> Hidden & Conditional Charges
          </h3>
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#1e2d52]">
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Charge</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Amount</th>
                    <th className="text-left text-xs text-slate-500 uppercase tracking-wider px-5 py-3">Triggered When</th>
                  </tr>
                </thead>
                <tbody>
                  {hiddenCharges.map((charge, i) => (
                    <tr key={i} className="border-b border-[#1e2d52]/50 last:border-0 hover:bg-[#131c38] transition-colors">
                      <td className="px-5 py-3.5 text-sm text-white font-medium">{charge.name}</td>
                      <td className="px-5 py-3.5 text-sm text-amber-400 font-mono">{charge.amount || '—'}</td>
                      <td className="px-5 py-3.5 text-sm text-slate-400">{charge.when_triggered || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {risks.length === 0 && (
        <div className="card text-center py-12">
          <CheckSquare className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
          <p className="text-emerald-400 font-semibold">No significant risks detected</p>
          <p className="text-slate-500 text-sm mt-1">This document appears relatively straightforward.</p>
        </div>
      )}

      {/* Disclaimer */}
      <div className="bg-[#090e1e] border border-[#1e2d52] rounded-2xl p-4 flex gap-3">
        <AlertCircle className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
        <p className="text-slate-500 text-xs leading-relaxed">
          This risk analysis is generated by AI for informational purposes only. It does not constitute legal or financial advice.
          Always consult a qualified professional before signing any financial agreement.
        </p>
      </div>
    </div>
  )
}
