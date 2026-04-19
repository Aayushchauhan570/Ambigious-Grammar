/**
 * GrammarInput.jsx
 * 
 * Grammar input area with:
 * - Textarea with line numbers
 * - Sample grammar buttons for quick testing
 * - Syntax format hints
 */

import { useState } from 'react';

const SAMPLE_GRAMMARS = [
  {
    name: 'Ambiguous Expression',
    grammar: 'E -> E + E | E * E | id',
    string: 'id + id * id',
    description: 'Classic ambiguous expression grammar',
  },
  {
    name: 'Unambiguous Expression',
    grammar: 'E -> E + T | T\nT -> T * F | F\nF -> ( E ) | id',
    string: 'id + id * id',
    description: 'Proper precedence with separate non-terminals',
  },
  {
    name: 'Dangling Else',
    grammar: 'S -> if C then S else S | if C then S | a\nC -> b',
    string: 'if b then if b then a else a',
    description: 'Classic ambiguous if-then-else',
  },
  {
    name: 'Simple Unambiguous',
    grammar: 'S -> a S b | a b',
    string: 'a a b b',
    description: 'Balanced a/b grammar (unambiguous)',
  },
];

export default function GrammarInput({ grammar, setGrammar, inputString, setInputString }) {
  const [activeSample, setActiveSample] = useState(null);

  const lineCount = grammar.split('\n').length;

  function handleSampleClick(sample, index) {
    setGrammar(sample.grammar);
    setInputString(sample.string);
    setActiveSample(index);
  }

  return (
    <div className="space-y-6">
      {/* Sample grammars */}
      <div>
        <div className="section-label">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          Sample Grammars
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_GRAMMARS.map((sample, i) => (
            <button
              key={i}
              className={`sample-chip ${activeSample === i ? 'active' : ''}`}
              onClick={() => handleSampleClick(sample, i)}
              title={sample.description}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grammar textarea with line numbers */}
      <div>
        <div className="section-label">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
          </svg>
          Production Rules
        </div>

        <div className="relative glass-card overflow-hidden">
          <div className="flex">
            {/* Line numbers */}
            <div className="flex flex-col py-4 px-3 bg-dark-800/50 border-r border-white/[0.04] select-none min-w-[3rem]">
              {Array.from({ length: Math.max(lineCount, 5) }, (_, i) => (
                <div
                  key={i}
                  className="text-gray-600 text-xs font-mono leading-relaxed text-right pr-1"
                  style={{ lineHeight: '1.625rem' }}
                >
                  {i + 1}
                </div>
              ))}
            </div>

            {/* Textarea */}
            <textarea
              id="grammar-input"
              value={grammar}
              onChange={(e) => {
                setGrammar(e.target.value);
                setActiveSample(null);
              }}
              placeholder={`E -> E + E | E * E | id\nT -> T * F | F\nF -> ( E ) | id`}
              className="flex-1 bg-transparent border-none outline-none text-gray-100 font-mono text-sm
                         px-4 py-4 resize-none placeholder-gray-600 min-h-[130px]"
              style={{ lineHeight: '1.625rem' }}
              spellCheck={false}
              rows={5}
            />
          </div>

          {/* Format hint */}
          <div className="px-4 py-2.5 border-t border-white/[0.04] bg-dark-800/30">
            <p className="text-[11px] text-gray-500 font-mono">
              Format: <span className="text-accent-purple/70">NonTerminal</span>
              <span className="text-gray-600"> → </span>
              <span className="text-accent-cyan/70">symbol symbol</span>
              <span className="text-gray-600"> | </span>
              <span className="text-accent-cyan/70">symbol</span>
              <span className="text-gray-500 ml-3">Use uppercase for non-terminals, separate symbols with spaces</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
