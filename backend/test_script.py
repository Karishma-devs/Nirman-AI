"""
Test script for AI Communication Scoring API
Run this to verify your API is working correctly
"""

import requests
import json
from typing import Dict, Any

# Configuration
API_URL = "http://localhost:8000"  # Change to your deployed URL

# Test transcripts
TEST_TRANSCRIPTS = {
    "excellent": """
        Good morning everyone. Today I would like to present a comprehensive analysis 
        of our project outcomes. The research demonstrates clear evidence of success 
        across multiple dimensions. First, our methodology was structured and systematic, 
        ensuring reliable results. The data reveals compelling patterns that support our 
        hypothesis. Moreover, the findings are relevant to current industry challenges 
        and provide actionable insights. I've organized this presentation to maintain 
        your attention and facilitate understanding. The vocabulary I'm using is 
        professional yet accessible, and I've included concrete examples to illustrate 
        key points. In conclusion, this work represents a significant contribution to 
        the field and opens exciting avenues for future research.
    """,
    
    "good": """
        Hello, I'm here to talk about communication skills. Effective communication 
        requires clarity and organization. When speaking, it's important to articulate 
        your ideas clearly and use appropriate language. Good content should be relevant 
        and informative. Engaging your audience helps maintain their interest. Professional 
        vocabulary and proper grammar are essential elements of strong communication.
    """,
    
    "average": """
        Today I want to discuss some topics that are kind of important. Communication 
        is about talking and making people understand. You should try to be clear when 
        you speak. It's good to have some organization in what you say. Using good words 
        helps too. People like it when you're interesting.
    """,
    
    "poor": """
        Um, so like, I'm gonna talk about stuff. It's kinda important I guess. 
        Yeah, so communication and things. You know what I mean?
    """,
    
    "too_short": "This is too short.",
    
    "too_long": " ".join(["word"] * 600)  # 600 words - exceeds limit
}

def test_health_check():
    """Test if the API is running"""
    print("\n" + "="*60)
    print("🔍 Testing Health Check...")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/")
        if response.status_code == 200:
            print("✅ API is online!")
            print(f"Response: {response.json()}")
            return True
        else:
            print(f"❌ Unexpected status code: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print(f"❌ Cannot connect to API at {API_URL}")
        print("   Make sure the backend server is running!")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_scoring(transcript: str, label: str) -> Dict[str, Any]:
    """Test the scoring endpoint with a transcript"""
    print("\n" + "-"*60)
    print(f"📝 Testing: {label}")
    print("-"*60)
    
    try:
        response = requests.post(
            f"{API_URL}/score",
            json={"transcript": transcript},
            headers={"Content-Type": "application/json"}
        )
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Status: Success")
            print(f"📊 Overall Score: {result['overall_score']}/100")
            print(f"📏 Word Count: {result['total_words']}")
            print("\n📋 Criteria Breakdown:")
            
            for criterion in result['criteria']:
                print(f"\n  • {criterion['name']}: {criterion['score']}/100")
                print(f"    Semantic Similarity: {criterion['semantic_similarity']}%")
                print(f"    Keywords Found: {len(criterion['keywords_found'])}/{len(criterion['keywords_found']) + len(criterion['keywords_missing'])}")
                print(f"    Weight: {criterion['weight']*100}%")
            
            return result
        else:
            print(f"❌ Status: Failed (HTTP {response.status_code})")
            print(f"Error: {response.json()}")
            return None
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return None

def test_rubric_endpoint():
    """Test the rubric endpoint"""
    print("\n" + "="*60)
    print("📚 Testing Rubric Endpoint...")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/rubric")
        if response.status_code == 200:
            rubric = response.json()
            print("✅ Rubric retrieved successfully!")
            print(f"\nNumber of criteria: {len(rubric['rubric'])}")
            for criterion in rubric['rubric']:
                print(f"\n  • {criterion['name']} (weight: {criterion['weight']*100}%)")
                print(f"    Keywords: {', '.join(criterion['keywords'][:5])}...")
            return True
        else:
            print(f"❌ Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_validation():
    """Test input validation"""
    print("\n" + "="*60)
    print("🛡️ Testing Input Validation...")
    print("="*60)
    
    # Test too short
    print("\n1. Testing transcript that's too short...")
    response = requests.post(
        f"{API_URL}/score",
        json={"transcript": TEST_TRANSCRIPTS["too_short"]}
    )
    if response.status_code == 400:
        print("✅ Correctly rejected short transcript")
    else:
        print("❌ Should have rejected short transcript")
    
    # Test too long
    print("\n2. Testing transcript that's too long...")
    response = requests.post(
        f"{API_URL}/score",
        json={"transcript": TEST_TRANSCRIPTS["too_long"]}
    )
    if response.status_code == 400:
        print("✅ Correctly rejected long transcript")
    else:
        print("❌ Should have rejected long transcript")

def compare_scores():
    """Compare scores across different quality transcripts"""
    print("\n" + "="*60)
    print("📈 Comparing Transcript Quality Scores...")
    print("="*60)
    
    scores = {}
    
    for quality in ["excellent", "good", "average", "poor"]:
        result = test_scoring(TEST_TRANSCRIPTS[quality], quality.upper())
        if result:
            scores[quality] = result['overall_score']
    
    print("\n" + "="*60)
    print("📊 SCORE SUMMARY")
    print("="*60)
    for quality, score in scores.items():
        print(f"{quality.upper():12} : {score:6.1f}/100")
    
    # Verify scores are in expected order
    if len(scores) == 4:
        if scores['excellent'] > scores['good'] > scores['average'] > scores['poor']:
            print("\n✅ Score ordering is correct!")
        else:
            print("\n⚠️  Warning: Score ordering may need adjustment")

def run_all_tests():
    """Run complete test suite"""
    print("\n" + "="*60)
    print("🚀 AI COMMUNICATION SCORING API TEST SUITE")
    print("="*60)
    print(f"Testing API at: {API_URL}")
    
    # Test 1: Health check
    if not test_health_check():
        print("\n❌ Cannot proceed - API is not accessible")
        return
    
    # Test 2: Rubric endpoint
    test_rubric_endpoint()
    
    # Test 3: Input validation
    test_validation()
    
    # Test 4: Score different quality transcripts
    compare_scores()
    
    print("\n" + "="*60)
    print("✅ TEST SUITE COMPLETED")
    print("="*60)
    print("\n💡 Tips:")
    print("   - If tests pass locally, try with your deployed URL")
    print("   - Check that CORS is configured for your frontend domain")
    print("   - Monitor response times for the first request (model loading)")
    print("   - Verify all criteria weights sum to 1.0")

if __name__ == "__main__":
    # You can change this to your deployed URL
    # API_URL = "https://your-api.onrender.com"
    
    run_all_tests()
    
    # Optional: Interactive mode
    print("\n" + "="*60)
    print("🎯 Want to test a custom transcript?")
    choice = input("Enter 'y' for yes, any other key to exit: ")
    
    if choice.lower() == 'y':
        print("\nPaste your transcript (press Enter twice when done):")
        lines = []
        while True:
            line = input()
            if line:
                lines.append(line)
            else:
                break
        
        if lines:
            custom_transcript = "\n".join(lines)
            test_scoring(custom_transcript, "CUSTOM TRANSCRIPT")
    
    print("\n👋 Testing complete! Thank you!")