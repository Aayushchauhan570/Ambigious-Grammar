/**
 * server.js
 * 
 * Entry point for the Grammar Ambiguity Checker backend.
 * Sets up Express with CORS, JSON parsing, routes, and error handling.
 * In production, also serves the React frontend build.
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const grammarRoutes = require('./routes/grammarRoutes');

const app = express();
const PORT = process.env.PORT || 5001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// === MIDDLEWARE ===

// CORS: Allow all origins in production (API is public), restrict in dev
if (NODE_ENV === 'development') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  }));
} else {
  app.use(cors());
}

app.use(express.json({ limit: '1mb' }));

// === API ROUTES ===
app.use('/api', grammarRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Grammar Ambiguity Checker API is running.' });
});

// === SERVE FRONTEND IN PRODUCTION ===
if (NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // For any non-API route, serve the React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
} else {
  // === 404 HANDLER (dev only, since production catches all with *) ===
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: `Route ${req.method} ${req.originalUrl} not found.`,
    });
  });
}

// === GLOBAL ERROR HANDLER ===
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error.',
  });
});

// === START SERVER ===
app.listen(PORT, () => {
  console.log(`\n🔧 Grammar Ambiguity Checker API`);
  console.log(`   Mode: ${NODE_ENV}`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = app;
