import { useState, useEffect } from 'react'
import { Calculator, TrendingDown, IndianRupee, Info } from 'lucide-react'

function formatINR(num) {
  if (!num || isNaN(num)) return '—'
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num)
}

function parseAmount(str) {
  if (!str) return null
  const clean = str.replace(/[₹,\s]/g, '').replace(/[^0-9.]/g, '')
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function parseTenure(str) {
  if (!str) return null
  const lower = str.toLowerCase()
  if (lower.includes('month')) {
    const m = parseFloat(lower)
    return isNaN(m) ? null : m / 12
  }
  const y = parseFloat(lower)
  return isNaN(y) ? null : y
}

function parseRate(str) {
  if (!str) return null
  const clean = str.replace('%', '').replace('p.a.', '').trim()
  const n = parseFloat(clean)
  return isNaN(n) ? null : n
}

function calcEMI(principal, ratePercent, tenureYears) {
  const r = ratePercent / 12 / 100
  const n = tenureYears * 12
  if (r === 0) return principal / n
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1)
}

export default function EMICalculator({ metrics }) {
  const prefillAmount = parseAmount(metrics?.loan_amount) || ''
  const prefillRate = parseRate(metrics?.interest_rate) || ''
  const prefillTenure = parseTenure(metrics?.loan_tenure) || ''

  const [principal, setPrincipal] = useState(prefillAmount)
  const [rate, setRate] = useState(prefillRate)
  const [tenure, setTenure] = useState(prefillTenure)
  const [result, setResult] = useState(null)

  useEffect(() => {
    if (principal && rate && tenure) {
      const p = parseFloat(principal)
      const r = parseFloat(rate)
      const t = parseFloat(tenure)
      if (!isNaN(p) && !isNaN(r) && !isNaN(t) && p > 0 && r > 0 && t > 0) {
        const emi = calcEMI(p, r, t)
        const total = emi * t * 12
        const interest = total - p
        setResult({ emi, total, interest, months: Math.round(t * 12) })
      } else {
        setResult(null)
      }
    } else {
      setResult(null)
    }
  }, [principal, rate, tenure])

  const hasPrefill = !!(prefillAmount || prefillRate || prefillTenure)

  return (
    <div className="space-y-6">
      {hasPrefill && (
        <div className="flex items-start gap-3 bg-gold-500/8 border border-gold-500/20 rounded-2xl p-4">
          <Info className="w-4 h-4 text-gold-400 flex-shrink-0 mt-0.5" />
          <p className="text-gold-200 text-sm">
            We pre-filled the values from your document. Adjust them to model different scenarios.
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        <div className="card">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Loan Amount (₹)</label>
          <input
            type="number"
            value={principal}
            onChange={e => setPrincipal(e.target.value)}
            placeholder="e.g. 5000000"
            className="w-full bg-[#090e1e] border border-[#1e2d52] focus:border-gold-500/50 rounded-xl px-4 py-3 text-white text-lg font-mono outline-none transition-colors"
          />
          <p className="text-xs text-slate-600 mt-2">{principal ? formatINR(parseFloat(principal)) : 'Enter amount'}</p>
        </div>

        <div className="card">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Interest Rate (% p.a.)</label>
          <input
            type="number"
            step="0.1"
            value={rate}
            onChange={e => setRate(e.target.value)}
            placeholder="e.g. 8.5"
            className="w-full bg-[#090e1e] border border-[#1e2d52] focus:border-gold-500/50 rounded-xl px-4 py-3 text-white text-lg font-mono outline-none transition-colors"
          />
          <p className="text-xs text-slate-600 mt-2">RBI repo rate ~6.5% as of 2025</p>
        </div>

        <div className="card">
          <label className="block text-xs text-slate-500 uppercase tracking-wider mb-2">Tenure (Years)</label>
          <input
            type="number"
            step="1"
            value={tenure}
            onChange={e => setTenure(e.target.value)}
            placeholder="e.g. 20"
            className="w-full bg-[#090e1e] border border-[#1e2d52] focus:border-gold-500/50 rounded-xl px-4 py-3 text-white text-lg font-mono outline-none transition-colors"
          />
          <p className="text-xs text-slate-600 mt-2">{tenure ? `${Math.round(tenure * 12)} monthly EMIs` : 'Enter tenure'}</p>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Main result */}
          <div className="card-glow text-center py-8">
            <p className="text-slate-500 text-sm uppercase tracking-wider mb-2">Your Monthly EMI</p>
            <div className="text-5xl font-display font-bold text-gold-400 mb-1">
              {formatINR(result.emi)}
            </div>
            <p className="text-slate-500 text-sm">per month for {result.months} months</p>
          </div>

          {/* Breakdown */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="card text-center">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <IndianRupee className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Principal</p>
              <p className="text-xl font-bold text-white">{formatINR(parseFloat(principal))}</p>
            </div>

            <div className="card text-center">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-3">
                <TrendingDown className="w-5 h-5 text-red-400" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Interest</p>
              <p className="text-xl font-bold text-red-400">{formatINR(result.interest)}</p>
            </div>

            <div className="card text-center">
              <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center mx-auto mb-3">
                <Calculator className="w-5 h-5 text-gold-400" />
              </div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Total Payment</p>
              <p className="text-xl font-bold text-gold-400">{formatINR(result.total)}</p>
            </div>
          </div>

          {/* Interest ratio bar */}
          <div className="card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3">Payment Breakdown</p>
            <div className="flex rounded-full overflow-hidden h-4 mb-3">
              <div
                className="bg-blue-500 transition-all duration-500"
                style={{ width: `${(parseFloat(principal) / result.total) * 100}%` }}
              />
              <div className="bg-red-500 flex-1" />
            </div>
            <div className="flex gap-6 text-xs text-slate-400">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-full" />Principal {((parseFloat(principal)/result.total)*100).toFixed(1)}%</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500 rounded-full" />Interest {((result.interest/result.total)*100).toFixed(1)}%</span>
            </div>
          </div>

          {/* RBI tip */}
          {parseFloat(rate) > 10 && (
            <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/20 rounded-2xl p-4">
              <span className="text-lg flex-shrink-0">⚠️</span>
              <div>
                <p className="text-amber-300 text-sm font-medium">High Interest Rate Detected</p>
                <p className="text-slate-400 text-xs mt-1">
                  Your interest rate of {rate}% p.a. is significantly above the RBI repo rate (~6.5%). Consider negotiating with the bank or comparing offers from other lenders. Under RBI guidelines, lenders must offer you the External Benchmark Lending Rate (EBLR).
                </p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-3 bg-emerald-500/8 border border-emerald-500/20 rounded-2xl p-4">
            <span className="text-lg flex-shrink-0">💡</span>
            <div>
              <p className="text-emerald-300 text-sm font-medium">RBI Prepayment Right</p>
              <p className="text-slate-400 text-xs mt-1">
                For floating-rate loans, RBI mandates zero prepayment penalty. Even prepaying ₹10,000 extra/month can save you <strong className="text-white">{formatINR(result.interest * 0.15)}</strong> in total interest.
              </p>
            </div>
          </div>
        </div>
      )}

      {!result && (
        <div className="card text-center py-12">
          <Calculator className="w-10 h-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Enter loan details above to calculate your EMI</p>
        </div>
      )}
    </div>
  )
}
