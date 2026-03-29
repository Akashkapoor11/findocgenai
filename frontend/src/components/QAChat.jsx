import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Sparkles, RotateCcw } from 'lucide-react'

const SUGGESTED_QUESTIONS = [
  'What is my total interest payment over the full loan tenure?',
  'What happens if I miss an EMI payment?',
  'Can I prepay this loan and what will it cost me?',
  'What are all the fees and charges in this document?',
  'What are the most important things I should know before signing?',
  'Is there a lock-in period in this document?',
  'What collateral or security is required?',
  'What are the default consequences?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`msg-enter flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-gold-500/15 border border-gold-500/25' : 'bg-blue-500/10 border border-blue-500/20'
      }`}>
        {isUser
          ? <User className="w-4 h-4 text-gold-400" />
          : <Bot className="w-4 h-4 text-blue-400" />
        }
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-gold-500/10 border border-gold-500/20 text-gold-100 rounded-tr-sm'
          : 'bg-[#0d1428] border border-[#1e2d52] text-slate-200 rounded-tl-sm'
      }`}>
        {msg.content}
        <div className={`text-xs mt-1.5 ${isUser ? 'text-gold-500/60 text-right' : 'text-slate-600'}`}>
          {msg.time}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
        <Bot className="w-4 h-4 text-blue-400" />
      </div>
      <div className="bg-[#0d1428] border border-[#1e2d52] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map(i => (
          <span
            key={i}
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}

export default function QAChat({ sessionId, apiUrl }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "👋 Hello! I've read your entire document and I'm ready to answer any questions. Ask me about specific clauses, fees, your rights, or anything else — in plain English!",
      time: 'Now',
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [usedSuggestions, setUsedSuggestions] = useState(new Set())
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const now = () => new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })

  async function sendQuestion(question) {
    const q = question.trim()
    if (!q || loading) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q, time: now() }])
    setLoading(true)

    try {
      const res = await fetch(`${apiUrl}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, question: q }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.detail || 'Failed to get answer')
      }

      const data = await res.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer, time: now() }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${err.message}. Please try again.`,
        time: now(),
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleSuggestion(q) {
    setUsedSuggestions(prev => new Set([...prev, q]))
    sendQuestion(q)
  }

  function clearChat() {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! I still have your document in memory — feel free to ask anything.",
      time: now(),
    }])
  }

  const availableSuggestions = SUGGESTED_QUESTIONS.filter(q => !usedSuggestions.has(q)).slice(0, 4)

  return (
    <div className="grid lg:grid-cols-3 gap-6 h-full">
      {/* Chat window */}
      <div className="lg:col-span-2 flex flex-col" style={{ height: '580px' }}>
        <div className="card flex-1 overflow-y-auto space-y-4 p-4 scrollbar-thin"
          style={{ scrollbarColor: '#2d3a5e transparent' }}>
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-3 flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendQuestion(input)}
              placeholder="Ask anything about your document…"
              disabled={loading}
              className="w-full bg-[#0d1428] border border-[#1e2d52] focus:border-gold-500/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 outline-none transition-colors pr-10"
            />
          </div>
          <button
            onClick={() => sendQuestion(input)}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-gold-500 hover:bg-gold-400 disabled:bg-[#1e2d52] disabled:cursor-not-allowed rounded-xl flex items-center justify-center transition-all"
          >
            <Send className="w-4 h-4 text-navy-950 disabled:text-slate-600" />
          </button>
          <button
            onClick={clearChat}
            className="w-11 h-11 bg-[#0d1428] hover:bg-[#131c38] border border-[#1e2d52] rounded-xl flex items-center justify-center transition-all text-slate-500 hover:text-slate-300"
            title="Clear chat"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Suggested questions */}
      <div className="space-y-4">
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-gold-400" />
            <h3 className="font-semibold text-white text-sm">Suggested Questions</h3>
          </div>
          <div className="space-y-2">
            {availableSuggestions.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                disabled={loading}
                className="w-full text-left text-xs text-slate-300 bg-[#090e1e] hover:bg-[#131c38] border border-[#1e2d52] hover:border-gold-500/30 rounded-xl px-3 py-2.5 transition-all duration-200 leading-relaxed disabled:opacity-50"
              >
                {q}
              </button>
            ))}
            {availableSuggestions.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-4">
                You've explored all suggested questions! Type your own.
              </p>
            )}
          </div>
        </div>

        {/* Tips */}
        <div className="card border-blue-500/10">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">💡 Pro Tips</p>
          <ul className="space-y-2 text-xs text-slate-400 leading-relaxed">
            {[
              'Ask about specific clause numbers you noticed',
              'Ask "Is this normal?" for any confusing term',
              'Ask about your rights as a borrower',
              'Ask about what to negotiate before signing',
            ].map(tip => (
              <li key={tip} className="flex items-start gap-2">
                <span className="text-gold-500 mt-0.5">→</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
