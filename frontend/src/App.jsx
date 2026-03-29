import { useState } from 'react'
import Header from './components/Header'
import UploadSection from './components/UploadSection'
import ProcessingState from './components/ProcessingState'
import Dashboard from './components/Dashboard'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Friendly error messages for common failures
function humaniseError(err) {
  const msg = err.message || ''
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED')) {
    return 'Cannot reach the server. Make sure the backend is running on port 8000 (run: uvicorn main:app --reload).'
  }
  if (msg.includes('Only PDF')) return 'Only PDF files are supported. Please upload a .pdf file.'
  if (msg.includes('15 MB')) return 'File is too large. Please upload a PDF under 15 MB.'
  if (msg.includes('scanned') || msg.includes('no extractable text')) {
    return 'This PDF appears to be a scanned image. Please use a text-based PDF or a searchable PDF.'
  }
  if (msg.includes('Session expired')) return 'Your session expired. Please re-upload the document.'
  if (msg.includes('GEMINI_API_KEY')) return 'Server configuration error: Gemini API key is missing. Check backend/.env.'
  return msg || 'An unexpected error occurred. Please try again.'
}

export default function App() {
  const [phase, setPhase] = useState('upload') // 'upload' | 'processing' | 'dashboard'
  const [sessionData, setSessionData] = useState(null)
  const [processingMsg, setProcessingMsg] = useState('')
  const [error, setError] = useState('')

  const PROCESSING_STEPS = [
    '📄 Extracting text from your document…',
    '🔍 Segmenting clauses and sections…',
    '🧠 Building AI knowledge index…',
    '⚡ Analysing with Gemini 2.5 Flash…',
    '🛡️ Generating risk checklist…',
    '✅ Finalising your report…',
  ]

  async function handleFileUpload(file) {
    setError('')
    setPhase('processing')
    let step = 0
    setProcessingMsg(PROCESSING_STEPS[0])

    const stepInterval = setInterval(() => {
      step = Math.min(step + 1, PROCESSING_STEPS.length - 1)
      setProcessingMsg(PROCESSING_STEPS[step])
    }, 1400)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(stepInterval)

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ detail: 'Upload failed' }))
        throw new Error(errBody.detail || 'Upload failed')
      }

      const data = await res.json()

      // Warn user if we fell back to minimal analysis
      if (data.analysis_status === 'fallback') {
        console.warn('⚠️ Analysis used fallback — Gemini returned invalid JSON')
      }

      setSessionData({ ...data, apiUrl: API_URL })
      setPhase('dashboard')
    } catch (err) {
      clearInterval(stepInterval)
      setError(humaniseError(err))
      setPhase('upload')
    }
  }

  function handleReset() {
    setSessionData(null)
    setError('')
    setPhase('upload')
  }

  return (
    <div className="min-h-screen bg-[#050813] relative overflow-x-hidden noise-bg">
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      <div className="relative z-10">
        <Header onReset={phase === 'dashboard' ? handleReset : null} />

        {phase === 'upload' && (
          <UploadSection onUpload={handleFileUpload} externalError={error} />
        )}

        {phase === 'processing' && (
          <ProcessingState message={processingMsg} />
        )}

        {phase === 'dashboard' && sessionData && (
          <Dashboard data={sessionData} apiUrl={API_URL} />
        )}
      </div>
    </div>
  )
}
