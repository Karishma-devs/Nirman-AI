import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re
from fuzzywuzzy import fuzz
import logging
import os
from typing import List

from models.schemas import ScoringResponse, CriterionResult

# Initialize sentence transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Configure logging
logger = logging.getLogger(__name__)

def load_rubric():
    """
    Load rubric from Excel or return default rubric.
    Expected columns: name, description, keywords, weight, min_words, max_words
    """
    # Check if Excel file exists
    rubric_file = os.getenv("RUBRIC_FILE", "rubric.xlsx")
    if os.path.exists(rubric_file):
        try:
            df = pd.read_excel(rubric_file)
            rubric = []
            for _, row in df.iterrows():
                rubric.append({
                    "name": row["name"],
                    "description": row["description"],
                    "keywords": row["keywords"].split(",") if isinstance(row["keywords"], str) else [],
                    "weight": float(row["weight"]),
                    "min_words": int(row["min_words"]) if not pd.isna(row["min_words"]) else 50,
                    "max_words": int(row["max_words"]) if not pd.isna(row["max_words"]) else 500
                })
            return rubric
        except Exception as e:
            logger.warning(f"Error loading rubric from Excel: {e}. Using default rubric.")
    
    # Default rubric
    rubric = [
        {
            "name": "Clarity and Articulation",
            "description": "Clear pronunciation and well-structured sentences",
            "keywords": ["clear", "articulate", "precise", "understandable", "coherent", "structured", "organized", "logical"],
            "weight": 0.25,
            "min_words": 50,
            "max_words": 500
        },
        {
            "name": "Content Quality",
            "description": "Relevant, informative, and well-organized content",
            "keywords": ["relevant", "informative", "detailed", "organized", "evidence", "examples", "facts", "data", "analysis"],
            "weight": 0.30,
            "min_words": 50,
            "max_words": 500
        },
        {
            "name": "Engagement",
            "description": "Ability to maintain audience interest and connect",
            "keywords": ["engaging", "interesting", "compelling", "attention", "enthusiasm", "dynamic", "passionate", "captivating"],
            "weight": 0.20,
            "min_words": 50,
            "max_words": 500
        },
        {
            "name": "Language Proficiency",
            "description": "Proper grammar, vocabulary, and language use",
            "keywords": ["vocabulary", "grammar", "language", "professional", "appropriate", "fluent", "eloquent", "articulate"],
            "weight": 0.25,
            "min_words": 50,
            "max_words": 500
        }
    ]
    return rubric

def preprocess_text(text: str) -> str:
    """Clean and normalize text"""
    text = text.lower()
    text = re.sub(r'[^\w\s]', ' ', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def count_words(text: str) -> int:
    """Count words in text"""
    return len(text.split())

def check_keywords(transcript: str, keywords: List[str], fuzzy_threshold: int = 85) -> tuple:
    """
    Check for keywords in transcript using exact and fuzzy matching.
    Returns (found_keywords, missing_keywords, keyword_score)
    """
    transcript_lower = preprocess_text(transcript)
    found = []
    missing = []
    
    for keyword in keywords:
        keyword_lower = keyword.lower()
        # Exact match
        if keyword_lower in transcript_lower:
            found.append(keyword)
        else:
            # Fuzzy match
            words = transcript_lower.split()
            fuzzy_matched = any(fuzz.ratio(keyword_lower, word) >= fuzzy_threshold for word in words)
            if fuzzy_matched:
                found.append(keyword)
            else:
                missing.append(keyword)
    
    # Calculate keyword score (0-100)
    keyword_score = (len(found) / len(keywords)) * 100 if keywords else 0
    return found, missing, keyword_score

def calculate_semantic_similarity(transcript: str, criterion_description: str, keywords: List[str]) -> float:
    """
    Calculate semantic similarity between transcript and criterion.
    Returns similarity score (0-100)
    """
    try:
        # Create reference text from description and keywords
        reference_text = f"{criterion_description}. Keywords: {', '.join(keywords)}"
        
        # Generate embeddings
        transcript_embedding = model.encode([transcript])
        reference_embedding = model.encode([reference_text])
        
        # Calculate cosine similarity
        similarity = cosine_similarity(transcript_embedding, reference_embedding)[0][0]
        
        # Convert to 0-100 scale
        similarity_score = float(similarity * 100)
        return max(0, min(100, similarity_score))
    except Exception as e:
        logger.error(f"Error calculating semantic similarity: {e}")
        return 0.0

def calculate_word_count_score(word_count: int, min_words: int, max_words: int) -> tuple:
    """
    Calculate score based on word count compliance.
    Returns (score, feedback)
    """
    if word_count < min_words:
        # Penalize for being too short
        score = (word_count / min_words) * 100
        feedback = f"Transcript is shorter than recommended ({word_count}/{min_words} words). Consider adding more detail."
    elif word_count > max_words:
        # Penalize for being too long
        excess = word_count - max_words
        penalty = min(50, (excess / 100) * 20)
        score = max(50, 100 - penalty)
        feedback = f"Transcript exceeds recommended length ({word_count}/{max_words} words). Consider being more concise."
    else:
        score = 100
        feedback = "Good length - within recommended range."
    
    return score, feedback

def score_criterion(transcript: str, criterion: dict, word_count: int) -> CriterionResult:
    """
    Score a single criterion using weighted combination of:
    - Keyword score (40%)
    - Semantic similarity (50%)
    - Word count compliance (10%)
    """
    # Keyword analysis
    found_keywords, missing_keywords, keyword_score = check_keywords(
        transcript, 
        criterion["keywords"]
    )
    
    # Semantic similarity
    semantic_score = calculate_semantic_similarity(
        transcript,
        criterion["description"],
        criterion["keywords"]
    )
    
    # Word count compliance
    word_count_score, length_feedback = calculate_word_count_score(
        word_count,
        criterion.get("min_words", 50),
        criterion.get("max_words", 500)
    )
    
    # Calculate weighted criterion score
    criterion_score = (
        (keyword_score * 0.40) +
        (semantic_score * 0.50) +
        (word_count_score * 0.10)
    )
    
    return CriterionResult(
        name=criterion["name"],
        description=criterion["description"],
        score=round(criterion_score, 1),
        semantic_similarity=round(semantic_score, 1),
        keywords_found=found_keywords,
        keywords_missing=missing_keywords,
        length_feedback=length_feedback,
        weight=criterion["weight"]
    )

def score_transcript(transcript: str) -> ScoringResponse:
    """
    Score a communication transcript based on multiple criteria.
    
    Args:
        transcript: The transcript text to score
        
    Returns:
        ScoringResponse with overall score and per-criterion breakdown
    """
    transcript = transcript.strip()
    word_count = count_words(transcript)
    
    # Validate word count
    if word_count < 10:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Transcript must contain at least 10 words"
        )
    
    if word_count > 500:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=400,
            detail="Transcript exceeds maximum length of 500 words"
        )
    
    # Load rubric
    rubric = load_rubric()
    
    # Score each criterion
    criteria_results = []
    for criterion in rubric:
        result = score_criterion(transcript, criterion, word_count)
        criteria_results.append(result)
    
    # Calculate overall weighted score
    overall_score = sum(
        result.score * result.weight 
        for result in criteria_results
    )
    
    return ScoringResponse(
        overall_score=round(overall_score, 1),
        total_words=word_count,
        criteria=criteria_results
    )