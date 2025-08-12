const functions = require('firebase-functions');
const express = require('express');
const session = require('express-session');
const path = require('path');

// Import your server modules (these would need to be adapted for Firebase Functions)
// For now, this is a simplified version that would need your actual server code

const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Session configuration for Firebase Functions
app.use(session({
  secret: process.env.SESSION_SECRET || 'loop-lab-firebase-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Always use secure cookies in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Serve static files in production
app.use(express.static(path.join(__dirname, 'dist')));

// Catch-all handler for client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Export the function
exports.app = functions.https.onRequest(app);