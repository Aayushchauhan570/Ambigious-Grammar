/**
 * StringInput.jsx
 * 
 * Input field for the test string, with token preview.
 */

export default function StringInput({ inputString, setInputString, tokens }) {
  return (
    <div>
      <div className="section-label">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
        </svg>
        Test String
      </div>

      <div className="glass-card overflow-hidden">
        <input
          id="string-input"
          type="text"
          value={inputString}
          onChange={(e) => setInputString(e.target.value)}
          placeholder="id + id * id"
          className="w-full bg-transparent border-none outline-none text-gray-100 font-mono text-sm
                     px-4 py-3.5 placeholder-gray-600"
          spellCheck={false}
        />

        {/* Token preview */}
        {tokens && tokens.length > 0 && (
          <div className="px-4 py-2.5 border-t border-white/[0.04] bg-dark-800/30">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] text-gray-500 font-mono mr-1">Tokens:</span>
              {tokens.map((token, i) => (
                <span
                  key={i}
                  className="inline-flex items-center px-2 py-0.5 rounded bg-accent-cyan/10
                             text-accent-cyan text-[11px] font-mono border border-accent-cyan/20"
                >
                  {token}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
