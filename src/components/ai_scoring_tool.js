import React, { useState } from 'react';
import { Upload, FileText, TrendingUp, CheckCircle, XCircle, ChevronDown, ChevronUp, Sparkles, BarChart3, MessageSquare, BookOpen } from 'lucide-react';

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
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBg = (score) => {
    if (score >= 80) return 'bg-emerald-50/30 border-emerald-200/50';
    if (score >= 60) return 'bg-amber-50/30 border-amber-200/50';
    return 'bg-rose-50/30 border-rose-200/50';
  };

  const getScoreGlow = (score) => {
    if (score >= 80) return 'shadow-[0_0_15px_rgba(16,185,129,0.3)]';
    if (score >= 60) return 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    return 'shadow-[0_0_15px_rgba(244,63,94,0.3)]';
  };

  // Icons for each criterion
  const criterionIcons = {
    "Clarity and Articulation": MessageSquare,
    "Content Quality": BookOpen,
    "Engagement": Sparkles,
    "Language Proficiency": BarChart3
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 mt-6">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            AI Communication Scoring Tool
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Evaluate spoken communication transcripts with AI-powered analysis
          </p>
        </div>

        {/* Glass morphism container */}
        <div className="backdrop-blur-lg bg-white/30 rounded-2xl shadow-xl border border-white/50 p-6 mb-8">
          {/* Input Section */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
              <FileText className="mr-2 text-indigo-600" size={28} />
              Input Transcript
            </h2>
            
            <div className="relative mb-6">
              <textarea
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                placeholder="Paste your spoken communication transcript here... (10-500 words)"
                className="w-full h-64 p-6 text-lg border-2 border-indigo-200/50 rounded-2xl focus:ring-4 focus:ring-indigo-300 focus:border-indigo-400 resize-none backdrop-blur-sm bg-white/50 shadow-lg transition-all duration-300"
              />
              <div className="absolute bottom-4 right-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                {transcript.trim() ? `${transcript.trim().split(/\s+/).length} words` : '0 words'}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
                {/* Enhanced Upload Button */}
                <label className="flex flex-col items-center justify-center w-48 h-32 bg-gradient-to-br from-indigo-100/70 to-purple-100/70 text-indigo-800 rounded-2xl cursor-pointer hover:from-indigo-200/70 hover:to-purple-200/70 transition-all duration-300 backdrop-blur-sm border-2 border-dashed border-indigo-300/50 hover:border-indigo-400/70 shadow-lg group">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-indigo-500 group-hover:text-indigo-600 transition-colors" />
                    <p className="text-lg font-semibold text-indigo-700 mb-1">Upload File</p>
                    <p className="text-xs text-indigo-500">.txt files only</p>
                  </div>
                  <input
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                
                <div className="text-center">
                  <div className="bg-indigo-100/70 text-indigo-800 px-4 py-2 rounded-full backdrop-blur-sm inline-block">
                    <span className="font-semibold">Word Limit:</span> 10-500 words
                  </div>
                </div>
              </div>

              {/* Enhanced Score Button */}
              <button
                onClick={analyzeTranscript}
                disabled={loading || !transcript.trim()}
                className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xl font-bold rounded-2xl hover:from-indigo-600 hover:to-purple-600 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all flex items-center justify-center shadow-2xl hover:shadow-indigo-500/30 transform hover:-translate-y-1 duration-300 group"
              >
                <TrendingUp className="mr-3 group-hover:scale-110 transition-transform" size={28} />
                <span>{loading ? 'Analyzing...' : 'Score Transcript'}</span>
              </button>
            </div>

            {error && (
              <div className="mt-6 p-5 bg-rose-50/50 border-2 border-rose-200/50 text-rose-700 rounded-2xl backdrop-blur-sm shadow-lg">
                <div className="flex items-center">
                  <XCircle className="mr-3 text-rose-500" size={24} />
                  <span className="text-lg font-semibold">{error}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Results Section */}
        {results && (
          <div className="space-y-8">
            {/* Overall Score Card */}
            <div className="backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/50 p-8">
              <div className="flex flex-col md:flex-row items-center justify-between">
                <div className="mb-8 md:mb-0 text-center md:text-left">
                  <h2 className="text-3xl font-bold text-gray-800 mb-3">
                    Overall Communication Score
                  </h2>
                  <p className="text-gray-600 text-lg">
                    Based on {results.criteria?.length ?? results.criterias?.length ?? 0} evaluation criteria • {results.totalWords ?? results.total_words ?? 0} words analyzed
                  </p>
                </div>
                <div className="relative">
                  <div className={`relative w-48 h-48 rounded-full flex items-center justify-center backdrop-blur-sm border-8 ${getScoreBg(results.overallScore ?? results.overall_score ?? 0)} ${getScoreGlow(results.overallScore ?? results.overall_score ?? 0)}`}>
                    <div className="text-center">
                      <div className={`text-5xl font-bold ${getScoreColor(results.overallScore ?? results.overall_score ?? 0)}`}>
                        {results.overallScore ?? results.overall_score ?? 0}
                      </div>
                      <div className="text-gray-600 text-xl mt-1">out of 100</div>
                    </div>
                    <div className="absolute inset-0 rounded-full border-8 border-transparent border-t-indigo-500 animate-spin-slow"></div>
                  </div>
                </div>
              </div>
              
              {/* Performance Summary */}
              <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100/30">
                  <h3 className="font-bold text-indigo-700 text-lg mb-2">Strengths</h3>
                  <p className="text-gray-700">Your communication shows good structure and clarity in key areas.</p>
                </div>
                <div className="bg-amber-50/40 p-5 rounded-2xl border border-amber-100/30">
                  <h3 className="font-bold text-amber-700 text-lg mb-2">Opportunities</h3>
                  <p className="text-gray-700">Focus on expanding vocabulary and adding more engaging elements.</p>
                </div>
                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100/30">
                  <h3 className="font-bold text-emerald-700 text-lg mb-2">Recommendations</h3>
                  <p className="text-gray-700">Practice incorporating storytelling and concrete examples.</p>
                </div>
              </div>
            </div>

            {/* Add a clear visual separation between sections */}
            <div className="my-8 h-px bg-gradient-to-r from-transparent via-indigo-200 to-transparent"></div>

            {/* Criteria Breakdown */}
            <div className="backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/50 p-8">
              <h3 className="text-3xl font-semibold text-gray-800 mb-8 flex items-center">
                <Sparkles className="mr-3 text-indigo-600" size={32} />
                Detailed Criteria Analysis
              </h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                  
                  const IconComponent = criterionIcons[name] || BookOpen;
                  
                  return (
                    <div
                      key={index}
                      className={`rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl ${getScoreBg(score)} ${expandedCriteria[index] ? 'shadow-lg' : ''}`}
                    >
                      <div
                        onClick={() => toggleCriterion(index)}
                        className="p-6 cursor-pointer"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center">
                            <div className="p-3 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl mr-4">
                              <IconComponent className="text-indigo-600" size={24} />
                            </div>
                            <div>
                              <h4 className="text-xl font-bold text-gray-800">
                                {name}
                              </h4>
                              <p className="text-sm text-gray-600 mt-1">
                                Weight: {(weight * 100).toFixed(0)}%
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                              {score}
                            </span>
                            <div>
                              {expandedCriteria[index] ? 
                                <ChevronUp size={24} className="text-gray-500" /> : 
                                <ChevronDown size={24} className="text-gray-500" />
                              }
                            </div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-gray-200/30 rounded-full h-3 mb-3">
                          <div
                            className={`h-3 rounded-full ${getScoreColor(score).replace('text-', 'bg-')}`}
                            style={{ width: `${score}%` }}
                          ></div>
                        </div>
                        
                        <p className="text-gray-700">
                          {description}
                        </p>
                      </div>

                      {expandedCriteria[index] && (
                        <div className="px-6 pb-6 border-t border-gray-200/30 pt-5">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                            {/* Semantic Similarity */}
                            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-4 rounded-xl border border-indigo-100/30">
                              <h5 className="font-bold text-gray-800 mb-3 flex items-center">
                                <BarChart3 size={20} className="mr-2 text-indigo-600" />
                                Semantic Similarity
                              </h5>
                              <div className="flex items-center">
                                <div className="flex-1 bg-gray-200/30 rounded-full h-3 mr-3">
                                  <div
                                    className="bg-gradient-to-r from-indigo-400 to-purple-500 h-3 rounded-full"
                                    style={{ width: `${semanticSimilarity}%` }}
                                  />
                                </div>
                                <span className="text-lg font-bold text-indigo-600">
                                  {semanticSimilarity}%
                                </span>
                              </div>
                            </div>

                            {/* Length Feedback */}
                            <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-4 rounded-xl border border-purple-100/30">
                              <h5 className="font-bold text-gray-800 mb-3">
                                Length Feedback
                              </h5>
                              <p className="text-gray-700">
                                {lengthFeedback}
                              </p>
                            </div>
                          </div>

                          {/* Keywords */}
                          <div className="bg-white/40 p-4 rounded-xl border border-gray-200/30">
                            <h5 className="font-bold text-gray-800 mb-4 text-lg">
                              Keywords Analysis
                            </h5>
                            
                            <div className="mb-4">
                              <div className="flex items-center mb-3">
                                <CheckCircle size={20} className="mr-2 text-emerald-500" />
                                <span className="font-semibold text-gray-800">Found Keywords ({keywordsFound.length})</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {keywordsFound.map((kw, i) => (
                                  <span
                                    key={i}
                                    className="px-3 py-1.5 bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 rounded-full text-sm font-medium flex items-center border border-emerald-200/50 shadow-sm"
                                  >
                                    <CheckCircle size={14} className="mr-1" />
                                    {kw}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {keywordsMissing.length > 0 && (
                              <div>
                                <div className="flex items-center mb-3">
                                  <XCircle size={20} className="mr-2 text-rose-500" />
                                  <span className="font-semibold text-gray-800">Missing Keywords ({keywordsMissing.length})</span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {keywordsMissing.map((kw, i) => (
                                    <span
                                      key={i}
                                      className="px-3 py-1.5 bg-gradient-to-r from-rose-100 to-pink-100 text-rose-800 rounded-full text-sm font-medium flex items-center border border-rose-200/50 shadow-sm"
                                    >
                                      <XCircle size={14} className="mr-1" />
                                      {kw}
                                    </span>
                                  ))}
                                </div>
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
          </div>
        )}

        {/* Info Section */}
        {!results && !loading && (
          <div className="backdrop-blur-lg bg-white/30 rounded-3xl shadow-2xl border border-white/50 p-8">
            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/50 p-5 rounded-2xl border border-indigo-100/30 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-indigo-500 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">1</span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">Input Transcript</h4>
                <p className="text-gray-700">
                  Paste or upload your spoken communication transcript (10-500 words)
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-purple-50/50 to-indigo-50/50 p-5 rounded-2xl border border-purple-100/30 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-purple-500 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">2</span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">AI Analysis</h4>
                <p className="text-gray-700">
                  Our AI evaluates your communication based on multiple criteria
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50/50 to-orange-50/50 p-5 rounded-2xl border border-amber-100/30 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">3</span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">Detailed Scoring</h4>
                <p className="text-gray-700">
                  Get scores for clarity, content, engagement, and language proficiency
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-emerald-50/50 to-green-50/50 p-5 rounded-2xl border border-emerald-100/30 shadow-lg">
                <div className="w-12 h-12 rounded-full bg-emerald-500 flex items-center justify-center text-white mb-4">
                  <span className="text-xl font-bold">4</span>
                </div>
                <h4 className="font-bold text-gray-800 text-lg mb-2">Actionable Insights</h4>
                <p className="text-gray-700">
                  Receive feedback to improve your communication skills
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Custom styles for animations */}
      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default CommunicationScoringTool;