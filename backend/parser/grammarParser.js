/**
 * grammarParser.js
 * 
 * Parses raw grammar text into a structured internal representation.
 * 
 * Input format (one or more lines):
 *   E -> E + E | E * E | id
 *   T -> T * F | F
 *   F -> ( E ) | id
 * 
 * Output structure:
 *   {
 *     startSymbol: "E",
 *     nonTerminals: Set {"E", "T", "F"},
 *     terminals: Set {"+", "*", "id", "(", ")"},
 *     productions: [
 *       { head: "E", body: ["E", "+", "E"] },
 *       { head: "E", body: ["E", "*", "E"] },
 *       { head: "E", body: ["id"] },
 *       ...
 *     ]
 *   }
 */

class GrammarParseError extends Error {
  constructor(message, line = null) {
    super(line !== null ? `Line ${line + 1}: ${message}` : message);
    this.name = 'GrammarParseError';
  }
}

/**
 * Parse raw grammar text into a structured grammar object.
 * @param {string} rawText - The grammar text with productions separated by newlines
 * @returns {object} Structured grammar
 */
function parseGrammar(rawText) {
  if (!rawText || rawText.trim().length === 0) {
    throw new GrammarParseError('Grammar input is empty');
  }

  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('//'));  // Allow comments

  if (lines.length === 0) {
    throw new GrammarParseError('No valid grammar rules found');
  }

  const nonTerminals = new Set();
  const productions = [];
  let startSymbol = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Support both -> and → as arrow
    const arrowMatch = line.match(/^(.+?)\s*(->|→)\s*(.+)$/);
    if (!arrowMatch) {
      throw new GrammarParseError(
        `Invalid production format. Expected "A -> α | β". Got: "${line}"`,
        i
      );
    }

    const head = arrowMatch[1].trim();
    const bodyText = arrowMatch[3].trim();

    // Validate head is a valid non-terminal (uppercase letter(s) or single uppercase followed by ')
    if (!isValidNonTerminal(head)) {
      throw new GrammarParseError(
        `Invalid non-terminal "${head}". Non-terminals should be uppercase letters (e.g., E, T, S, Expr).`,
        i
      );
    }

    // The first production's head is the start symbol
    if (startSymbol === null) {
      startSymbol = head;
    }
    nonTerminals.add(head);

    // Split alternatives by |, but be careful with | inside quotes or escaped
    const alternatives = splitAlternatives(bodyText);

    for (const alt of alternatives) {
      const trimmed = alt.trim();
      if (trimmed.length === 0) {
        throw new GrammarParseError(
          `Empty alternative in production for "${head}"`,
          i
        );
      }

      // Tokenize the body of the production into symbols
      const bodySymbols = tokenizeProductionBody(trimmed);
      if (bodySymbols.length === 0) {
        throw new GrammarParseError(
          `Empty production body in "${head} -> ${trimmed}"`,
          i
        );
      }

      productions.push({ head, body: bodySymbols });
    }
  }

  // Determine terminals: any symbol that appears in a production body but is not a non-terminal
  const terminals = new Set();
  for (const prod of productions) {
    for (const symbol of prod.body) {
      if (symbol !== 'ε' && !nonTerminals.has(symbol)) {
        terminals.add(symbol);
      }
    }
  }

  // Validate: every non-terminal on the RHS should have at least one production
  for (const prod of productions) {
    for (const symbol of prod.body) {
      if (isValidNonTerminal(symbol) && !nonTerminals.has(symbol)) {
        throw new GrammarParseError(
          `Non-terminal "${symbol}" is used in a production but has no defining rule`
        );
      }
    }
  }

  return {
    startSymbol,
    nonTerminals: Array.from(nonTerminals),
    terminals: Array.from(terminals),
    productions,
  };
}

/**
 * Check if a symbol looks like a valid non-terminal.
 * Non-terminals start with an uppercase letter and may contain uppercase letters, 
 * digits, underscores, or apostrophes (for primed variables like E').
 */
function isValidNonTerminal(symbol) {
  return /^[A-Z][A-Za-z0-9_']*$/.test(symbol);
}

/**
 * Split a production body by | to get alternatives.
 * Handles the pipe character as an alternation operator.
 */
function splitAlternatives(bodyText) {
  // Split on | that is surrounded by spaces or at start/end
  // This avoids splitting on | that might be part of a terminal
  const parts = [];
  let current = '';
  let i = 0;

  while (i < bodyText.length) {
    if (bodyText[i] === '|') {
      parts.push(current);
      current = '';
    } else {
      current += bodyText[i];
    }
    i++;
  }
  parts.push(current);

  return parts;
}

/**
 * Tokenize a production body string into individual symbols.
 * Symbols are separated by whitespace.
 * Examples:
 *   "E + E" → ["E", "+", "E"]
 *   "id"    → ["id"]
 *   "( E )" → ["(", "E", ")"]
 */
function tokenizeProductionBody(bodyStr) {
  return bodyStr.split(/\s+/).filter(s => s.length > 0);
}

module.exports = { parseGrammar, GrammarParseError };
