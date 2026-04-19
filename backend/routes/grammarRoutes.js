/**
 * grammarRoutes.js
 * 
 * Express router for grammar-related API endpoints.
 */

const express = require('express');
const router = express.Router();
const { checkAmbiguityHandler } = require('../controllers/grammarController');

/**
 * POST /api/check-ambiguity
 * Check if a CFG is ambiguous for a given input string.
 * 
 * Body: { grammar: string, string: string }
 */
router.post('/check-ambiguity', checkAmbiguityHandler);

module.exports = router;
