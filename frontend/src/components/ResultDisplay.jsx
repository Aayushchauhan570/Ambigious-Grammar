/**
 * ResultDisplay.jsx
 * 
 * Displays the ambiguity check result with:
 * - Animated result banner (green/red)
 * - Grammar info summary
 * - Tree count
 */

export default function ResultDisplay({ result, error }) {
  if (error) {
    return (
      <div className="animate-slide-up">
        <div className="glass-card border-accent-red/30 p-6">
          <div className="flex items-start gap-4">
            {/* Error icon */}
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <div>
              <h3 className="text-red-400 font-semibold text-sm mb-1">Error</h3>
              <p className="text-gray-300 text-sm leading-relaxed">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const { ambiguous, treeCount, message, grammarInfo, canParse } = result;

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Main result banner */}
      <div
        className={`glass-card p-6 border ${
          !canParse
            ? 'border-amber-500/30 bg-gradient-to-r from-amber-500/5 to-transparent'
            : ambiguous
            ? 'result-ambiguous'
            : 'result-not-ambiguous'
        }`}
      >
        <div className="flex items-center gap-4">
          {/* Status icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center ${
              !canParse
                ? 'bg-amber-500/10'
                : ambiguous
                ? 'bg-red-500/10'
                : 'bg-emerald-500/10'
            }`}
          >
            {!canParse ? (
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            ) : ambiguous ? (
              <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            <h3
              className={`text-lg font-bold mb-1 ${
                !canParse
                  ? 'text-amber-400'
                  : ambiguous
                  ? 'text-red-400'
                  : 'text-emerald-400'
              }`}
            >
              {!canParse
                ? 'Cannot Parse'
                : ambiguous
                ? 'Grammar is Ambiguous'
                : 'Grammar is Not Ambiguous'}
            </h3>
            <p className="text-gray-300 text-sm">{message}</p>
          </div>

          {/* Tree count badge */}
          {canParse && (
            <div className="flex-shrink-0 text-center">
              <div
                className={`text-3xl font-extrabold ${
                  ambiguous ? 'text-red-400' : 'text-emerald-400'
                }`}
              >
                {treeCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">
                Parse {treeCount === 1 ? 'Tree' : 'Trees'}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grammar info */}
      {grammarInfo && (
        <div className="glass-card p-5">
          <h4 className="text-xs uppercase tracking-[0.15em] font-semibold text-gray-400 mb-3">
            Grammar Details
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-lg font-bold text-accent-purple">{grammarInfo.startSymbol}</div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Start Symbol</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent-blue">
                {grammarInfo.nonTerminals?.length || 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Non-Terminals</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent-cyan">
                {grammarInfo.terminals?.length || 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Terminals</div>
            </div>
            <div>
              <div className="text-lg font-bold text-accent-pink">
                {grammarInfo.productionCount || 0}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-gray-500">Productions</div>
            </div>
          </div>

          {/* Production list */}
          {grammarInfo.productions && (
            <div className="mt-4 pt-3 border-t border-white/[0.04]">
              <div className="flex flex-wrap gap-2">
                {grammarInfo.productions.map((prod, i) => (
                  <span
                    key={i}
                    className="inline-flex px-2.5 py-1 rounded-lg bg-dark-800/60 text-[11px] font-mono text-gray-400 border border-white/[0.04]"
                  >
                    {prod}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
