'use strict';
require('dotenv').config();

const express    = require('express');
const cors       = require('cors');
const authRoutes  = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// ── CORS ───────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:3001',
  'http://localhost:3000',
  'http://127.0.0.1:3001',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (curl, Postman, mobile)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials:    true,
    methods:        ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ── Body Parsing ───────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// ── Security Headers (basic, no helmet needed) ─────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

// ── Routes ─────────────────────────────────────────────────────
app.use('/api/auth',  authRoutes);
app.use('/api/admin', adminRoutes);

// ── Health Check ───────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:      'OK',
    environment: process.env.NODE_ENV,
    timestamp:   new Date().toISOString(),
  });
});

// ── 404 ────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found.` });
});

// ── Global Error Handler ───────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('[ERROR]', err.message);
  if (process.env.NODE_ENV === 'development') console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

// ── Start ──────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT, 10) || 3000;
app.listen(PORT, () => {
  console.log(`\n🚀  AuthKit API`);
  console.log(`    ► http://localhost:${PORT}`);
  console.log(`    ► Environment : ${process.env.NODE_ENV}`);
  console.log(`    ► Health      : http://localhost:${PORT}/health\n`);
});

module.exports = app;
