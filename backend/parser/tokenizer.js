/**
 * tokenizer.js
 * 
 * Tokenizes an input string based on the grammar's terminal symbols.
 * 
 * The tokenizer is grammar-aware: it uses the set of terminal symbols
 * from the parsed grammar to know what tokens to look for.
 * 
 * Strategy:
 *   1. Sort terminals by length (longest first) for greedy matching
 *   2. At each position, try to match the longest terminal
 *   3. Skip whitespace between tokens
 *   4. Report errors for unrecognizable characters
 */

class TokenizeError extends Error {
  constructor(message) {
    super(message);
    this.name = 'TokenizeError';
  }
}

/**
 * Tokenize an input string using the grammar's terminal set.
 * @param {string} input - The input string to tokenize
 * @param {string[]} terminals - Array of terminal symbols from the grammar
 * @returns {string[]} Array of tokens
 */
function tokenize(input, terminals) {
  if (!input || input.trim().length === 0) {
    throw new TokenizeError('Input string is empty');
  }

  const trimmed = input.trim();

  // Sort terminals by length (longest first) for greedy matching
  const sortedTerminals = [...terminals].sort((a, b) => b.length - a.length);

  const tokens = [];
  let pos = 0;

  while (pos < trimmed.length) {
    // Skip whitespace
    if (/\s/.test(trimmed[pos])) {
      pos++;
      continue;
    }

    // Try to match a terminal at current position
    let matched = false;
    for (const terminal of sortedTerminals) {
      if (trimmed.startsWith(terminal, pos)) {
        // Check that a multi-char terminal isn't part of a longer word
        // e.g., "id" shouldn't match the start of "identity" unless "identity" isn't a terminal
        const endPos = pos + terminal.length;
        if (
          terminal.length > 1 &&
          /[a-zA-Z0-9_]/.test(terminal[terminal.length - 1]) &&
          endPos < trimmed.length &&
          /[a-zA-Z0-9_]/.test(trimmed[endPos])
        ) {
          // This terminal is a prefix of a longer word — skip it
          continue;
        }

        tokens.push(terminal);
        pos += terminal.length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Try to give a helpful error message
      const remaining = trimmed.substring(pos, pos + 10);
      throw new TokenizeError(
        `Unable to tokenize at position ${pos}: "${remaining}..." ` +
        `Known terminals: [${sortedTerminals.join(', ')}]`
      );
    }
  }

  return tokens;
}

module.exports = { tokenize, TokenizeError };
