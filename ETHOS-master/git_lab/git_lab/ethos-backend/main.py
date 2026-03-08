from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from narrative_engine import generate_role_reversal_narrative
from sentiment_engine import analyze_reflection_sentiment
from utils.pdf_generator import generate_pdf_report

app = FastAPI(title="Ethos API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ScenarioRequest(BaseModel):
    scenario: str

class ReflectionRequest(BaseModel):
    reflection: str

@app.post("/generate-narrative")
async def generate_narrative(request: ScenarioRequest):
    narrative = generate_role_reversal_narrative(request.scenario)
    return {"narrative": narrative}

@app.post("/analyze-reflection")
async def analyze_reflection(request: ReflectionRequest):
    sentiment, score, source, explanation = analyze_reflection_sentiment(request.reflection)
    return {
        "sentiment": sentiment,
        "score": score,
        "source": source,
        "explanation": explanation
    }

@app.get("/")
def read_root():
    return {"message": "Ethos API is running"}


@app.get("/download-report")
def download_report():

    # Dummy test data (baad me real logic add karenge)
    sessions = [
        {"text": "I raised my voice at my colleague."},
        {"text": "I blamed my junior publicly."}
    ]

    stats = {
        "totalSessions": 6,
        "averageScore": 58,
        "trend": "Improving",
        "trendPercentage": 32,
        "mostCommon": "Defensive"
    }

    pdf_buffer = generate_pdf_report(stats, sessions)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=ethos_report.pdf"
        }
    )
