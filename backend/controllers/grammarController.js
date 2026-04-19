/**
 * grammarController.js
 * 
 * Controller that handles the business logic for grammar-related API endpoints.
 * Separates HTTP concerns from the core algorithm.
 */

const { checkAmbiguity, GrammarParseError, TokenizeError, ParseError } = require('../parser/ambiguityChecker');

/**
 * POST /api/check-ambiguity
 * 
 * Request body:
 *   { grammar: string, string: string }
 * 
 * Response:
 *   { success, data | error }
 */
async function checkAmbiguityHandler(req, res) {
  try {
    const { grammar, string } = req.body;

    // Validation
    if (!grammar || typeof grammar !== 'string' || grammar.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Grammar input is required and must be a non-empty string.',
      });
    }

    if (!string || typeof string !== 'string' || string.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Test string is required and must be a non-empty string.',
      });
    }

    // Run ambiguity check
    const result = checkAmbiguity(grammar.trim(), string.trim());

    return res.json({
      success: true,
      data: result,
    });

  } catch (error) {
    // Handle known error types with specific messages
    if (error instanceof GrammarParseError) {
      return res.status(400).json({
        success: false,
        error: `Grammar Error: ${error.message}`,
        errorType: 'grammar',
      });
    }

    if (error instanceof TokenizeError) {
      return res.status(400).json({
        success: false,
        error: `Tokenization Error: ${error.message}`,
        errorType: 'tokenization',
      });
    }

    if (error instanceof ParseError) {
      return res.status(400).json({
        success: false,
        error: `Parse Error: ${error.message}`,
        errorType: 'parse',
      });
    }

    // Unknown error
    console.error('Unexpected error in checkAmbiguity:', error);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred. Please try again.',
      errorType: 'internal',
    });
  }
}

module.exports = { checkAmbiguityHandler };
