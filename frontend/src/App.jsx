/**
 * App.jsx
 * 
 * 
 * 
 * Main application component that orchestrates the Grammar Ambiguity Checker.
 * Handles state management, API calls, and layout.
 */

import { useState } from 'react';
import Header from './components/Header';
import GrammarInput from './components/GrammarInput';
import StringInput from './components/StringInput';
import ResultDisplay from './components/ResultDisplay';
import ParseTreeViewer from './components/ParseTreeViewer';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

export default function App() {
  const [grammar, setGrammar] = useState('');
  const [inputString, setInputString] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tokens, setTokens] = useState(null);

  async function handleCheck() {
    if (!grammar.trim()) {
      setError('Please enter grammar production rules.');
      setResult(null);
      return;
    }
    if (!inputString.trim()) {
      setError('Please enter a test string.');
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setTokens(null);

    try {
      const response = await fetch(`${API_URL}/check-ambiguity`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          grammar: grammar.trim(),
          string: inputString.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setError(data.error || 'An unexpected error occurred.');
        return;
      }

      setResult(data.data);
      setTokens(data.data.tokens || null);
    } catch (err) {
      setError(
        err.message === 'Failed to fetch'
          ? 'Cannot connect to the server. Make sure the backend is running on port 5001.'
          : `Error: ${err.message}`
      );
    } finally {
      setLoading(false);
    }
  }

  function handleClear() {
    setGrammar('');
    setInputString('');
    setResult(null);
    setError(null);
    setTokens(null);
  }

  return (
    <div className="min-h-screen bg-grid relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pb-20">
        <Header />

        <main className="space-y-6 mt-4">
          {/* Input Section */}
          <section>
            <GrammarInput
              grammar={grammar}
              setGrammar={setGrammar}
              inputString={inputString}
              setInputString={setInputString}
            />
          </section>

          <section>
            <StringInput
              inputString={inputString}
              setInputString={setInputString}
              tokens={tokens}
            />
          </section>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              id="check-button"
              onClick={handleCheck}
              disabled={loading}
              className="btn-primary flex items-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Check Grammar
                </>
              )}
            </button>

            <button
              onClick={handleClear}
              className="px-6 py-3.5 rounded-xl font-medium text-gray-400 hover:text-white
                         border border-white/[0.06] hover:border-white/[0.15] transition-all duration-200
                         hover:bg-dark-600/30"
            >
              Clear
            </button>
          </div>

          {/* Loading spinner */}
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="loader" />
            </div>
          )}

          {/* Results */}
          {(result || error) && !loading && (
            <section>
              <ResultDisplay result={result} error={error} />
            </section>
          )}

          {/* Parse Trees */}
          {result && result.parseTrees && result.parseTrees.length > 0 && !loading && (
            <section>
              <ParseTreeViewer parseTrees={result.parseTrees} />
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-white/[0.04] text-center">
          <p className="text-gray-600 text-xs">
            {/* Grammar Ambiguity Checker — Built with React, Express, and the Earley Parsing Algorithm */}
            Grammar Ambiguity Checker — Built with ❤️
          </p>
        </footer>
      </div>
    </div>
  );
}
