import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const CommunicationScoringTool = () => {
  const [transcript, setTranscript] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedCriteria, setExpandedCriteria] = useState({});

  // API endpoint
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (event) => {
        setTranscript(event.target.result);
        setError('');
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a .txt file');
    }
  };

  const analyzeTranscript = async () => {
    setError('');
    setLoading(true);

    // Validate input
    const wordCount = transcript.trim().split(/\s+/).length;
    if (wordCount < 10) {
      setError('Transcript must contain at least 10 words');
      setLoading(false);
      return;
    }
    if (wordCount > 500) {
      setError('Transcript exceeds maximum length of 500 words');
      setLoading(false);
      return;
    }

    // Call backend API
    try {
      const response = await fetch(`${API_BASE_URL}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transcript: transcript }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate the response structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from API');
      }
      
      if (data.criteria && !Array.isArray(data.criteria)) {
        throw new Error('Invalid criteria format in API response');
      }
      
      setResults(data);
      setLoading(false);
    } catch (err) {
      // Check if it's a network error (backend not running)
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        setError('Failed to connect to the backend API. Please make sure the backend server is running on http://localhost:8000');
      } else {
        setError(`Failed to analyze transcript: ${err.message}`);
      }
      setLoading(false);
    }
  };

  const toggleCriterion = (index) => {
    setExpandedCriteria(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-green-50 border-green-200';
    if (score >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            AI Communication Scoring Tool
          </h1>
          <p className="text-gray-600">
            Evaluate spoken communication transcripts with AI-powered analysis
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
            <FileText className="mr-2" size={24} />
            Input Transcript
          </h2>
          
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Paste your spoken communication transcript here... (10-500 words)"
            className="w-full h-48 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />

          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg cursor-pointer hover:bg-gray-200 transition">
                <Upload className="mr-2" size={20} />
                Upload .txt file
                <input
                  type="file"
                  accept=".txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <span className="text-sm text-gray-500">
                {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words` : '0 words'}
              </span>
            </div>

            <button
              onClick={analyzeTranscript}
              disabled={loading || !transcript.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition flex items-center"
            >
              <TrendingUp className="mr-2" size={20} />
              {loading ? 'Analyzing...' : 'Score Transcript'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Overall Score
                  </h2>
                  <p className="text-gray-600">
                    Based on {results.criteria?.length ?? results.criterias?.length ?? 0} criteria • {results.totalWords ?? results.total_words ?? 0} words
                  </p>
                </div>
                <div className={`text-6xl font-bold ${getScoreColor(results.overallScore ?? results.overall_score ?? 0)}`}>
                  {results.overallScore ?? results.overall_score ?? 0}
                  <span className="text-2xl">/100</span>
                </div>
              </div>
            </div>

            {/* Criteria Breakdown */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Detailed Criteria Analysis
              </h3>
              
              {(results.criteria ?? results.criterias ?? []).map((criterion, index) => {
                // Fallback lookup for camelCase and snake_case fields
                const name = criterion.name ?? '';
                const description = criterion.description ?? '';
                const score = criterion.score ?? 0;
                const weight = criterion.weight ?? 0;
                const semanticSimilarity = criterion.semanticSimilarity ?? criterion.semantic_similarity ?? 0;
                const keywordsFound = criterion.keywordsFound ?? criterion.keywords_found ?? [];
                const keywordsMissing = criterion.keywordsMissing ?? criterion.keywords_missing ?? [];
                const lengthFeedback = criterion.lengthFeedback ?? criterion.length_feedback ?? '';
                
                return (
                  <div
                    key={index}
                    className={`bg-white rounded-lg shadow-md border-2 transition ${getScoreBg(score)}`}
                  >
                    <div
                      onClick={() => toggleCriterion(index)}
                      className="p-4 cursor-pointer flex items-center justify-between"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-lg font-semibold text-gray-800">
                            {name}
                          </h4>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm text-gray-600">
                              Weight: {(weight * 100).toFixed(0)}%
                            </span>
                            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                              {score}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600">
                          {description}
                        </p>
                      </div>
                      <div className="ml-4">
                        {expandedCriteria[index] ? 
                          <ChevronUp size={24} className="text-gray-400" /> : 
                          <ChevronDown size={24} className="text-gray-400" />
                        }
                      </div>
                    </div>

                    {expandedCriteria[index] && (
                      <div className="px-4 pb-4 border-t border-gray-200 pt-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Semantic Similarity */}
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">
                              Semantic Similarity
                            </h5>
                            <div className="flex items-center">
                              <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                                <div
                                  className="bg-blue-600 h-3 rounded-full"
                                  style={{ width: `${semanticSimilarity}%` }}
                                />
                              </div>
                              <span className="text-sm font-semibold">
                                {semanticSimilarity}%
                              </span>
                            </div>
                          </div>

                          {/* Length Feedback */}
                          <div>
                            <h5 className="font-semibold text-gray-700 mb-2">
                              Length Feedback
                            </h5>
                            <p className="text-sm text-gray-600">
                              {lengthFeedback}
                            </p>
                          </div>
                        </div>

                        {/* Keywords */}
                        <div className="mt-4">
                          <h5 className="font-semibold text-gray-700 mb-2">
                            Keywords Analysis
                          </h5>
                          <div className="flex flex-wrap gap-2 mb-2">
                            {keywordsFound.map((kw, i) => (
                              <span
                                key={i}
                                className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs flex items-center"
                              >
                                <CheckCircle size={14} className="mr-1" />
                                {kw}
                              </span>
                            ))}
                          </div>
                          {keywordsMissing.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {keywordsMissing.map((kw, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs flex items-center"
                                >
                                  <XCircle size={14} className="mr-1" />
                                  {kw}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Info Section */}
        {!results && !loading && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">
              How it works
            </h3>
            <ul className="space-y-2 text-gray-600">
              <li>• Paste or upload your spoken communication transcript</li>
              <li>• AI analyzes based on multiple criteria including clarity, content, engagement, and language</li>
              <li>• Scoring combines keyword detection (40%), semantic similarity (50%), and length appropriateness (10%)</li>
              <li>• Get detailed feedback on each criterion with actionable insights</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunicationScoringTool;