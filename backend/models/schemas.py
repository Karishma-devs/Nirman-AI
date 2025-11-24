from pydantic import BaseModel, Field, ConfigDict
from typing import List

def to_camel(string: str) -> str:
    parts = string.split('_')
    return parts[0] + ''.join(word.title() for word in parts[1:])

class TranscriptRequest(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)
    
    transcript: str = Field(..., min_length=10, max_length=5000)

class CriterionResult(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)
    
    name: str
    description: str
    score: float
    semantic_similarity: float
    keywords_found: List[str]
    keywords_missing: List[str]
    length_feedback: str
    weight: float

class ScoringResponse(BaseModel):
    model_config = ConfigDict(alias_generator=to_camel, populate_by_name=True, str_strip_whitespace=True)
    
    overall_score: float
    total_words: int
    criteria: List[CriterionResult]