from pydantic import BaseModel, Field
from typing import List

class TranscriptRequest(BaseModel):
    transcript: str = Field(..., min_length=10, max_length=5000)

class CriterionResult(BaseModel):
    name: str
    description: str
    score: float
    semantic_similarity: float
    keywords_found: List[str]
    keywords_missing: List[str]
    length_feedback: str
    weight: float

class ScoringResponse(BaseModel):
    overall_score: float
    total_words: int
    criteria: List[CriterionResult]