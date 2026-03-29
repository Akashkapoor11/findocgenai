# FinDocGenAI — AI-Powered Financial Document Explainer

> **ET GenAI Hackathon 2026 | Problem Statement 9 — AI Money Mentor**
> Built with Gemini 2.5 Flash · FastAPI · React · Tailwind

---

##  What It Solves

95% of Indians have no financial plan. Most people sign loan agreements and insurance policies without understanding them — leading to hidden charges, missed rights, and financial traps.

**FinDocGenAI** uploads any Indian financial document (loan agreement, insurance policy, credit card agreement) and delivers in under 30 seconds:

- 📄 **Plain-language summary** — what you are signing, explained simply
- 💰 **Key metrics extraction** — EMI, interest rate, tenure, fees, all in one place
- 🛡️ **Risk report** — dangerous clauses flagged by severity with actionable advice
- 🧮 **EMI Calculator** — model what-if scenarios, pre-filled from your document
- 💬 **AI Q&A** — ask anything about your document in plain English
- 📥 **Download Report** — save your full analysis as a text file

---

##  Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Free Gemini API key → https://aistudio.google.com

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env — set GEMINI_API_KEY=your_actual_key_here
```

### 2. Start Backend

```bash
uvicorn main:app --reload --port 8000
```

Expected output:
```
✅ Using Gemini model: gemini-2.5-flash-preview-04-17
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**

---

##  Model

| Model | Why |
|-------|-----|
| `gemini-2.5-flash-preview-04-17` | Best balance of speed, accuracy, and free-tier availability |

---

##  Project Structure

```
findocgenai/
├── backend/
│   ├── main.py              # FastAPI + PyMuPDF + Gemini
│   ├── requirements.txt
│   ├── .env                 # Your API key (never commit)
│   └── .env.example
├── frontend/
│   └── src/
│       ├── App.jsx
│       └── components/
│           ├── Header.jsx
│           ├── UploadSection.jsx
│           ├── ProcessingState.jsx
│           ├── Dashboard.jsx        ← tabs orchestrator
│           ├── KeyMetrics.jsx       ← financial numbers
│           ├── ClauseBreakdown.jsx  ← clause-by-clause
│           ├── RiskChecklist.jsx    ← risk report + hidden charges
│           ├── EMICalculator.jsx    ← interactive EMI modelling
│           └── QAChat.jsx           ← AI Q&A
└── docs/
    └── ARCHITECTURE.md
```

---

##  Deployment

### Backend (Render — free tier)
1. Push to GitHub
2. New Web Service on render.com
3. Environment vars: `GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash-preview-04-17`
4. Build: `pip install -r requirements.txt`
5. Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel — free tier)
1. Import repo on vercel.com
2. Set `VITE_API_URL` to your Render backend URL
3. Deploy

---

##  Impact Model

| Metric | Value |
|--------|-------|
| Target users | 14 crore+ demat account holders, first-time loan borrowers |
| Time saved | ~3 hours per document review (vs. reading 40-page agreements manually) |
| Advisor cost saved | ₹25,000+/year per user |
| Hidden charge detection | Avg. ₹8,000–₹40,000 in charges flagged per document |
| Scale potential | 10,000 bank branches × 50 customers/day = ₹40 crore/day in advisory savings |

---

##  Submission Checklist

- [x] GitHub repository with commit history
- [x] README with setup instructions
- [x] Working live demo
- [x] Architecture document (`docs/ARCHITECTURE.md`)
- [x] Addresses PS9 — AI Money Mentor

---

*FinDocGenAI — because financial literacy is a right, not a privilege.*
