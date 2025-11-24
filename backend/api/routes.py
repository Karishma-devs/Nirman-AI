from fastapi import APIRouter, HTTPException
import logging

from models.schemas import TranscriptRequest, ScoringResponse
from utils.scoring import score_transcript, load_rubric

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "message": "AI Communication Scoring API",
        "version": "1.0.0"
    }

@router.post("/score", response_model=ScoringResponse)
async def score_transcript_endpoint(request: TranscriptRequest):
    """
    Score a communication transcript based on multiple criteria.
    
    Args:
        request: TranscriptRequest with transcript text
        
    Returns:
        ScoringResponse with overall score and per-criterion breakdown
    """
    try:
        result = score_transcript(request.transcript)
        logger.info(f"Scored transcript: {result.total_words} words, score: {result.overall_score:.1f}")
        return result
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error scoring transcript: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/rubric")
async def get_rubric():
    """Get the current scoring rubric"""
    return {"rubric": load_rubric()}