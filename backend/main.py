from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import os
import uuid
import json
import re
import fitz  # PyMuPDF
from dotenv import load_dotenv
from datetime import datetime, timedelta

# Gemini is optional. App must still run without it.
try:
    import google.generativeai as genai
except Exception:
    genai = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(dotenv_path=os.path.join(BASE_DIR, ".env"))

app = FastAPI(title="FinDocGenAI API", version="3.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "").strip()
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-preview-04-17")

llm = None
if genai and GEMINI_API_KEY:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
        llm = genai.GenerativeModel(GEMINI_MODEL)
        print(f"✅ Using Gemini model: {GEMINI_MODEL}")
    except Exception as e:
        print(f"⚠️ Gemini init failed, falling back to offline mode: {e}")
        llm = None
else:
    print("⚠️ GEMINI_API_KEY not found or Gemini package unavailable. Running in offline fallback mode.")

sessions: dict = {}
SESSION_TTL_HOURS = 2


class QuestionRequest(BaseModel):
    session_id: str
    question: str


def extract_text_from_pdf(file_bytes: bytes) -> tuple[str, int]:
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    pages = doc.page_count
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    doc.close()
    return text.strip(), pages


def build_session_store(text: str, session_id: str) -> None:
    chunk_size = 800
    overlap = 150
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunks.append(text[start:end])
        start += chunk_size - overlap

    sessions[session_id] = {
        "chunks": chunks,
        "full_text": text,
        "chunk_count": len(chunks),
        "created_at": datetime.utcnow().isoformat(),
    }


def cleanup_old_sessions():
    cutoff = datetime.utcnow() - timedelta(hours=SESSION_TTL_HOURS)
    expired = []
    for k, v in sessions.items():
        try:
            created = datetime.fromisoformat(v.get("created_at", "2000-01-01"))
            if created < cutoff:
                expired.append(k)
        except Exception:
            expired.append(k)

    for k in expired:
        del sessions[k]


def extract_json_robust(raw: str) -> dict:
    raw = raw.strip()

    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", raw)
    if fence_match:
        raw = fence_match.group(1).strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        pass

    brace_start = raw.find("{")
    if brace_start != -1:
        depth = 0
        for i, c in enumerate(raw[brace_start:], brace_start):
            if c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(raw[brace_start : i + 1])
                    except json.JSONDecodeError:
                        break

    raise ValueError(f"Could not extract valid JSON. Response starts: {raw[:200]}")


def build_fallback_analysis(text: str) -> dict:
    lower = text.lower()

    doc_type = "Financial Document"
    if any(k in lower for k in ["loan agreement", "loan", "emi"]):
        doc_type = "Loan/Financing Document"
    elif any(k in lower for k in ["insurance", "policy"]):
        doc_type = "Insurance Policy"
    elif any(k in lower for k in ["credit card", "card member"]):
        doc_type = "Credit Card Agreement"

    interest_match = re.search(r"(\d{1,2}(?:\.\d{1,2})?)\s*%?\s*(?:p\.?a\.?|per annum)", text, re.I)
    amount_match = re.search(r"₹\s?[\d,]+(?:\.\d+)?", text)
    emi_match = re.search(r"emi[^₹\n\r]*₹\s?[\d,]+(?:\.\d+)?", text, re.I)

    clauses = [
        {
            "id": 1,
            "title": "Document Loaded",
            "category": "other",
            "plain_english": "The document has been uploaded successfully. A detailed AI explanation is unavailable right now, but the file is ready for review and questions.",
            "importance": "medium",
            "borrower_impact": "You can still review the document and ask questions in the Q&A section.",
        }
    ]

    if interest_match:
        clauses.append(
            {
                "id": 2,
                "title": "Interest Rate Mentioned",
                "category": "repayment",
                "plain_english": f"The document appears to mention an interest rate around {interest_match.group(1)}%.",
                "importance": "high",
                "borrower_impact": "This affects how much you pay over time.",
            }
        )

    risks = [
        {
            "id": 1,
            "title": "Fallback analysis in use",
            "description": "The external AI service is unavailable or quota-limited, so this is a safe offline analysis.",
            "severity": "medium",
            "clause_reference": "System fallback",
            "recommendation": "Use the Q&A section or re-enable Gemini later for richer analysis.",
        }
    ]

    if interest_match:
        risks.append(
            {
                "id": 2,
                "title": "Interest cost may be significant",
                "description": f"An interest rate around {interest_match.group(1)}% is visible in the document.",
                "severity": "medium",
                "clause_reference": "Interest clause",
                "recommendation": "Compare against other offers and check whether the rate is fixed or floating.",
            }
        )

    if "prepayment" in lower or "foreclosure" in lower:
        risks.append(
            {
                "id": 3,
                "title": "Prepayment conditions present",
                "description": "The document seems to mention prepayment or foreclosure conditions.",
                "severity": "medium",
                "clause_reference": "Prepayment clause",
                "recommendation": "Check whether any charges apply before prepaying.",
            }
        )

    summary_bits = [
        "Your document was uploaded successfully.",
        "The app is running in fallback mode because the external AI service is unavailable.",
        "You can still use the Q&A feature and review the key extracted document text.",
    ]
    if amount_match:
        summary_bits.insert(1, f"A financial amount like {amount_match.group(0)} appears in the document.")
    if emi_match:
        summary_bits.append("An EMI-related line appears in the text.")

    return {
        "document_type": doc_type,
        "issuer": "Not specified",
        "summary": " ".join(summary_bits),
        "key_metrics": {
            "loan_amount": amount_match.group(0) if amount_match else None,
            "interest_rate": f"{interest_match.group(1)}% p.a." if interest_match else None,
            "loan_tenure": None,
            "emi_amount": emi_match.group(0) if emi_match else None,
            "processing_fee": None,
            "prepayment_penalty": None,
            "late_payment_fee": None,
            "effective_apr": None,
            "insurance_required": "Not specified",
        },
        "clauses": clauses,
        "risk_items": risks,
        "hidden_charges": [],
        "overall_risk_score": 5 if interest_match else 4,
        "risk_summary": "Manual review recommended. The fallback mode provides a safe summary, but a live model would give deeper clause-level insight.",
        "borrower_advice": "Review every fee, verify the repayment terms, and compare this document against at least one other offer before signing.",
        "red_flags": [
            "AI fallback mode used",
            "Check all fees and repayment terms manually",
        ],
    }


def analyze_with_gemini(text: str) -> dict:
    if llm is None:
        raise RuntimeError("Gemini is unavailable")

    excerpt = text[:6000] if len(text) > 6000 else text

    prompt = f"""You are FinDocGenAI — India's leading AI for financial document analysis.
Your job: help common Indians understand complex loan/insurance documents.

Respond ONLY with valid JSON. No markdown, no backticks, no explanation. Start with {{ and end with }}.

{{
  "document_type": "Exact type (Home Loan Agreement / Personal Loan / Term Insurance Policy / Vehicle Loan / Credit Card Agreement / etc.)",
  "issuer": "Bank or company name if found, else 'Not specified'",
  "summary": "3-4 sentences explaining what this document is, what the person is signing, and key obligations. Plain language, Class 10 level.",
  "key_metrics": {{
    "loan_amount": "Principal with ₹ symbol, or null",
    "interest_rate": "e.g. '8.5% p.a.' or null",
    "loan_tenure": "e.g. '20 years' or '240 months' or null",
    "emi_amount": "Monthly EMI with ₹ symbol or null",
    "processing_fee": "Amount or % or null",
    "prepayment_penalty": "Amount or % or null",
    "late_payment_fee": "Amount or % or null",
    "effective_apr": "Effective APR if different from nominal, or null",
    "insurance_required": "Yes / No / Not specified"
  }},
  "clauses": [
    {{
      "id": 1,
      "title": "Short descriptive name",
      "category": "repayment|fees|default|prepayment|insurance|legal|other",
      "plain_english": "1-2 simple sentences a first-time borrower will understand",
      "importance": "high|medium|low",
      "borrower_impact": "Concrete impact on the borrower's money or rights"
    }}
  ],
  "risk_items": [
    {{
      "id": 1,
      "title": "Risk name",
      "description": "Plain-language description of this risk",
      "severity": "high|medium|low",
      "clause_reference": "Which clause in the document triggers this",
      "recommendation": "Specific action the borrower should take — include RBI rules if relevant"
    }}
  ],
  "hidden_charges": [
    {{
      "name": "Charge name",
      "amount": "Amount or percentage",
      "when_triggered": "When this charge applies"
    }}
  ],
  "overall_risk_score": 6,
  "risk_summary": "One sentence on overall risk level for this Indian borrower",
  "borrower_advice": "3-4 actionable tips. Include: RBI consumer rights, prepayment rules, negotiation tips, what to check before signing.",
  "red_flags": ["Short phrase for each serious concern that could cost money or rights"]
}}

Identify 6-10 clauses, 4-6 risk items, all hidden charges.

Document:
{excerpt}"""

    response = llm.generate_content(prompt)
    raw = response.text.strip()
    return extract_json_robust(raw)


def analyze_document(text: str) -> dict:
    try:
        return analyze_with_gemini(text)
    except Exception as e:
        print(f"⚠️ Analysis fallback used: {e}")
        return build_fallback_analysis(text)


def answer_question_with_gemini(question: str, context: str, analysis_context: str) -> str:
    if llm is None:
        raise RuntimeError("Gemini is unavailable")

    prompt = f"""You are FinDocGenAI, a warm and knowledgeable financial assistant for Indian borrowers.

Context: {analysis_context}

Document sections:
{context}

Question: {question}

Answer in 2-4 clear sentences. Use ₹ for Indian rupees. If relevant, mention the borrower's rights. If info is not in the document, say so clearly and suggest what to ask the bank. Use **bold** for important warnings."""
    response = llm.generate_content(prompt)
    return response.text.strip()


def answer_question_fallback(question: str, analysis: dict) -> str:
    q = question.lower()
    metrics = analysis.get("key_metrics", {})
    doc_type = analysis.get("document_type", "this document")
    risk = analysis.get("risk_summary", "Manual review recommended.")

    if any(k in q for k in ["interest", "rate", "emi", "loan", "tenure", "payment"]):
        return (
            f"This appears to be a {doc_type}. The available summary says: {risk} "
            f"Check the key metrics section for visible values like interest rate, EMI, and loan amount. "
            f"If the exact number is not shown, ask the lender to confirm it in writing."
        )

    if any(k in q for k in ["fee", "charge", "penalty", "prepayment", "foreclosure"]):
        return (
            "Look carefully for processing fees, late payment charges, and any prepayment or foreclosure terms. "
            "If the document does not clearly show these charges, ask the provider for the full fee schedule before signing."
        )

    if any(k in q for k in ["risk", "danger", "problem", "red flag"]):
        return (
            f"The main risk in fallback mode is that the app cannot do deep AI parsing right now. "
            f"From the extracted summary: {risk} Review all repayment and fee terms manually."
        )

    return (
        "I could not use live AI for this answer, but the document is loaded and readable. "
        "Ask about interest rate, EMI, hidden charges, prepayment, or penalties for a more specific answer."
    )


@app.get("/")
async def home():
    cleanup_old_sessions()
    return {
        "message": "FinDocGenAI API is running",
        "mode": "gemini" if llm is not None else "fallback",
        "version": "3.1.0",
    }


@app.get("/health")
async def health():
    cleanup_old_sessions()
    return {
        "status": "ok",
        "mode": "gemini" if llm is not None else "fallback",
        "model": GEMINI_MODEL if llm is not None else "offline",
        "sessions_active": len(sessions),
        "version": "3.1.0",
    }


@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted.")

    contents = await file.read()
    if len(contents) > 15 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File exceeds 15 MB limit.")

    try:
        text, pages = extract_text_from_pdf(contents)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Could not read PDF: {str(e)}")

    if len(text) < 100:
        raise HTTPException(
            status_code=422,
            detail="PDF appears to be scanned/image-only with no extractable text. Please use a text-based PDF.",
        )

    session_id = str(uuid.uuid4())

    try:
        build_session_store(text, session_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session store error: {str(e)}")

    try:
        analysis = analyze_document(text)
        sessions[session_id]["analysis"] = analysis
        analysis_status = "success" if llm is not None else "fallback"
    except Exception as e:
        print(f"⚠️ Unexpected analysis error, using fallback: {e}")
        analysis = build_fallback_analysis(text)
        sessions[session_id]["analysis"] = analysis
        analysis_status = "fallback"

    cleanup_old_sessions()

    return {
        "session_id": session_id,
        "filename": file.filename,
        "pages": pages,
        "word_count": len(text.split()),
        "char_count": len(text),
        "analysis": analysis,
        "analysis_status": analysis_status,
    }


@app.post("/qa")
async def ask_question(req: QuestionRequest):
    if req.session_id not in sessions:
        raise HTTPException(
            status_code=404,
            detail="Session expired or not found. Please re-upload your document.",
        )

    session = sessions[req.session_id]
    chunks = session["chunks"]

    question_words = [w for w in req.question.lower().split() if len(w) > 3]
    scored = []
    for chunk in chunks:
        chunk_lower = chunk.lower()
        score = sum(1 for w in question_words if w in chunk_lower)
        scored.append((score, chunk))
    scored.sort(key=lambda x: x[0], reverse=True)

    top_chunks = [c for _, c in scored[:5]] if scored and scored[0][0] > 0 else chunks[:4]
    context = "\n\n---\n\n".join(top_chunks)

    analysis = session.get("analysis", {})
    analysis_context = (
        f"Document: {analysis.get('document_type', '')} | "
        f"Issuer: {analysis.get('issuer', '')} | "
        f"Metrics: {json.dumps(analysis.get('key_metrics', {}), ensure_ascii=False)}"
    )

    try:
        answer = answer_question_with_gemini(req.question, context, analysis_context)
    except Exception as e:
        print(f"⚠️ QA fallback used: {e}")
        answer = answer_question_fallback(req.question, analysis)

    return {"answer": answer, "session_id": req.session_id}


@app.get("/session/{session_id}/exists")
async def check_session(session_id: str):
    return {"exists": session_id in sessions}


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)