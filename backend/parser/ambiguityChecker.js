/**
 * ambiguityChecker.js
 * 
 * Orchestrates the grammar parsing, tokenization, Earley parsing,
 * and ambiguity detection workflow.
 * 
 * This is the main entry point called by the API controller.
 */

const { parseGrammar, GrammarParseError } = require('./grammarParser');
const { tokenize, TokenizeError } = require('./tokenizer');
const { earleyParse, ParseError } = require('./earleyParser');

/**
 * Check whether a grammar is ambiguous for a given input string.
 * 
 * @param {string} grammarText - Raw grammar text with productions
 * @param {string} inputString - The string to test
 * @returns {object} Result object with ambiguity verdict and parse trees
 */
function checkAmbiguity(grammarText, inputString) {
  // Step 1: Parse the grammar
  const grammar = parseGrammar(grammarText);

  // Step 2: Tokenize the input string
  const tokens = tokenize(inputString, grammar.terminals);

  // Step 3: Run the Earley parser
  const result = earleyParse(grammar, tokens);

  if (!result.success) {
    return {
      ambiguous: false,
      parseTrees: [],
      treeCount: 0,
      message: result.message,
      grammarInfo: {
        startSymbol: grammar.startSymbol,
        nonTerminals: grammar.nonTerminals,
        terminals: grammar.terminals,
        productionCount: grammar.productions.length,
      },
      tokens,
      canParse: false,
    };
  }

  // Step 4: Determine ambiguity
  const isAmbiguous = result.parseTrees.length > 1;

  return {
    ambiguous: isAmbiguous,
    parseTrees: result.parseTrees,
    treeCount: result.parseTrees.length,
    message: isAmbiguous
      ? `Grammar is AMBIGUOUS — ${result.parseTrees.length} distinct parse tree(s) found for "${inputString}".`
      : `Grammar is NOT AMBIGUOUS for "${inputString}" — exactly 1 parse tree found.`,
    grammarInfo: {
      startSymbol: grammar.startSymbol,
      nonTerminals: grammar.nonTerminals,
      terminals: grammar.terminals,
      productionCount: grammar.productions.length,
      productions: grammar.productions.map(p => `${p.head} → ${p.body.join(' ')}`),
    },
    tokens,
    canParse: true,
  };
}

module.exports = { checkAmbiguity, GrammarParseError, TokenizeError, ParseError };
