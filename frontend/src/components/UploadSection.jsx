import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, Shield, Zap, Brain, CheckCircle } from 'lucide-react'

const FEATURES = [
  { icon: Brain, label: 'AI-Powered Analysis', desc: 'Gemini 2.5 Flash understands complex legal language' },
  { icon: Shield, label: 'Risk Detection', desc: 'Identifies hidden fees and dangerous clauses instantly' },
  { icon: Zap, label: 'Instant Q&A', desc: 'Ask anything about your document in plain English' },
  { icon: CheckCircle, label: 'Clause Breakdown', desc: 'Every clause explained in simple language' },
]

const SAMPLE_DOCS = [
  'Home Loan Agreement (SBI/HDFC/ICICI)',
  'Personal Loan Contract',
  'Vehicle Loan Document',
  'Term Insurance Policy',
  'Credit Card Agreement',
]

export default function UploadSection({ onUpload, externalError }) {
  const [dragActive, setDragActive] = useState(false)
  const [error, setError] = useState('')
  const displayError = externalError || error

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('')
    if (rejectedFiles.length > 0) {
      setError('Only PDF files up to 15 MB are accepted.')
      return
    }
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0])
    }
  }, [onUpload])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setDragActive(true),
    onDragLeave: () => setDragActive(false),
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 15 * 1024 * 1024,
    multiple: false,
  })

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
      {/* Hero */}
      <div className="text-center mb-14 fade-up">
        <div className="inline-flex items-center gap-2 bg-gold-500/10 border border-gold-500/20 rounded-full px-4 py-1.5 mb-6">
          <span className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-pulse" />
          <span className="text-gold-400 text-sm font-medium">Problem Statement 9 — AI Money Mentor</span>
        </div>

        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
          Decode Your
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-amber-300">
            Financial Documents
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
          Upload any loan agreement or insurance policy. Our AI explains every clause in plain language,
          extracts key numbers, and flags hidden risks — in seconds.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 mt-8 text-sm text-slate-500">
          <span>✓ No signup required</span>
          <span>✓ Powered by Gemini AI</span>
          <span>✓ 100% free</span>
          <span>✓ Supports all Indian bank documents</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Upload Zone */}
        <div className="lg:col-span-3 fade-up fade-up-2">
          <div
            {...getRootProps()}
            className={`
              relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-300
              ${isDragActive || dragActive
                ? 'border-gold-400 bg-gold-500/5 upload-pulse'
                : 'border-[#1e2d52] hover:border-gold-500/50 bg-[#0d1428]/60 hover:bg-[#0d1428]'
              }
            `}
          >
            <input {...getInputProps()} />

            {/* Upload icon with glow */}
            <div className={`
              w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300
              ${isDragActive ? 'bg-gold-500/20 shadow-lg shadow-gold-500/20' : 'bg-[#131c38]'}
            `}>
              {isDragActive ? (
                <FileText className="w-9 h-9 text-gold-400" />
              ) : (
                <Upload className="w-9 h-9 text-slate-400" />
              )}
            </div>

            <h3 className="text-xl font-semibold text-white mb-2">
              {isDragActive ? 'Drop your PDF here' : 'Upload your financial document'}
            </h3>
            <p className="text-slate-400 text-sm mb-6">
              Drag & drop your PDF, or click to browse
            </p>

            <button className="btn-gold text-sm px-8 py-3 inline-flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Choose PDF File
            </button>

            <p className="text-slate-600 text-xs mt-4">Maximum file size: 15 MB</p>

            {displayError && (
              <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-red-400 text-sm">
                {displayError}
              </div>
            )}
          </div>

          {/* Supported documents */}
          <div className="mt-4 card">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-3">Supported Documents</p>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DOCS.map((doc) => (
                <span key={doc} className="bg-[#131c38] border border-[#1e2d52] rounded-lg px-3 py-1 text-xs text-slate-300">
                  {doc}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Feature cards */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <div key={label} className={`card fade-up fade-up-${i + 2} hover:border-gold-500/20 transition-all duration-300`}>
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <p className="font-semibold text-white text-sm">{label}</p>
                  <p className="text-slate-400 text-xs mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Stats card */}
          <div className="card-glow fade-up fade-up-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '95%', label: 'Indians lack\nfinancial plan' },
                { val: '₹25K+', label: 'Advisor fee\nper year' },
                { val: '10s', label: 'Time to full\nanalysis' },
                { val: '100%', label: 'Free to\nuse' },
              ].map(({ val, label }) => (
                <div key={val} className="text-center">
                  <div className="text-2xl font-display font-bold text-gold-400">{val}</div>
                  <div className="text-slate-500 text-xs mt-0.5 whitespace-pre-line leading-tight">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
