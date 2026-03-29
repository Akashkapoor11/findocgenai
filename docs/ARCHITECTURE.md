# FinDocGenAI — Architecture Document

## ET GenAI Hackathon 2026 | PS9 — AI Money Mentor

---

## System Overview

```
User (Browser)
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│  React Frontend (Vite + Tailwind)                       │
│                                                         │
│  UploadSection  →  ProcessingState  →  Dashboard        │
│                                         ├ KeyMetrics    │
│                                         ├ ClauseBreakdn │
│                                         ├ RiskChecklist │
│                                         ├ EMICalculator │
│                                         └ QAChat        │
└──────────────────────────┬──────────────────────────────┘
                           │ REST API
                           ▼
┌─────────────────────────────────────────────────────────┐
│  FastAPI Backend (Python)                               │
│                                                         │
│  POST /upload                                           │
│    1. PDF extraction (PyMuPDF)                          │
│    2. Text chunking (800 chars, 150 overlap)            │
│    3. Gemini 2.5 Flash analysis → structured JSON       │
│    4. Session store (in-memory, 2hr TTL)                │
│                                                         │
│  POST /qa                                               │
│    1. Keyword relevance scoring on chunks               │
│    2. Top-5 chunks + analysis context → Gemini          │
│    3. Conversational answer                             │
│                                                         │
│  GET /session/{id}/exists  (session check)             │
│  GET /health               (monitoring)                 │
└──────────────────────────┬──────────────────────────────┘
                           │ Gemini API
                           ▼
               ┌─────────────────────┐
               │  Google Gemini      │
               │  2.5 Flash          │
               │  (gemini-2.5-flash- │
               │   preview-04-17)    │
               └─────────────────────┘
```

---

## Component Roles

### Frontend

| Component | Role |
|-----------|------|
| `App.jsx` | State machine: upload → processing → dashboard. Error humanisation. |
| `UploadSection` | Drag-and-drop PDF upload with react-dropzone. Feature showcase. |
| `ProcessingState` | Animated step-by-step progress during analysis. |
| `Dashboard` | Tab orchestrator. Download report. Risk gauge. |
| `KeyMetrics` | Renders extracted financial numbers (EMI, rate, tenure, fees). |
| `ClauseBreakdown` | Filterable, expandable clause list with plain-English explanations. |
| `RiskChecklist` | Risk items by severity + hidden charges table. |
| `EMICalculator` | Interactive calculator pre-filled from document. RBI tips. |
| `QAChat` | Chat interface for document Q&A. Suggested questions. |

### Backend

| Module | Role |
|--------|------|
| `extract_text_from_pdf` | PyMuPDF extracts text from each page |
| `build_session_store` | Chunks text with overlap for retrieval |
| `extract_json_robust` | Multi-strategy JSON extraction from Gemini responses |
| `analyze_document` | Main analysis prompt → structured JSON |
| `build_fallback_analysis` | Safe fallback if Gemini returns invalid JSON |
| `cleanup_old_sessions` | TTL-based memory management |

---

## Data Flow: Upload

```
PDF File
  │
  ▼
PyMuPDF → Raw text (full document)
  │
  ▼
Chunking (800 chars, 150 overlap) → Session store
  │
  ▼
First 6000 chars → Gemini 2.5 Flash → JSON analysis
  │                  (document_type, key_metrics, clauses,
  │                   risk_items, hidden_charges, risk_score,
  │                   summary, advice, red_flags)
  ▼
extract_json_robust (handles markdown fences, brace matching)
  │
  ▼  [on failure → fallback analysis]
  │
  ▼
Response to frontend: session_id + analysis
```

## Data Flow: Q&A

```
User question
  │
  ▼
Keyword relevance scoring → Top 5 chunks
  │
  ▼
Prompt = [analysis context] + [top chunks] + [question]
  │
  ▼
Gemini 2.5 Flash → conversational answer
```

---

## Error Handling

| Failure | Handling |
|---------|----------|
| Non-PDF upload | HTTP 400 with clear message |
| File > 15 MB | HTTP 400 |
| Scanned/image PDF | HTTP 422 with suggestion |
| Gemini returns invalid JSON | Fallback analysis, session still usable |
| Session expired | HTTP 404 with re-upload prompt |
| Network error | Frontend humanises error message |

---

## India-Specific Intelligence

The Gemini prompt explicitly instructs the model to:

- Reference **RBI guidelines** (zero prepayment penalty for floating-rate loans)
- Flag rates above **RBI repo rate + 3%** as potentially high
- Mention **SARFAESI Act** implications for secured loans
- Suggest **EBLR (External Benchmark Lending Rate)** as a right for borrowers
- Provide advice in the context of **Indian banking regulations**

---

## Deployment Architecture

```
GitHub Repo
    │
    ├── Vercel (Frontend)
    │     VITE_API_URL → Render backend URL
    │
    └── Render (Backend, free tier)
          GEMINI_API_KEY, GEMINI_MODEL
          uvicorn main:app --host 0.0.0.0 --port $PORT
```

---

## Scalability Notes

- Current: In-memory session store (suitable for demo/hackathon)
- Production path: Redis for session storage, PostgreSQL for analysis history
- Sessions auto-expire after 2 hours via `cleanup_old_sessions()`
- Stateless design: each request is self-contained after session lookup
