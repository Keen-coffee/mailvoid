const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { generateTempEmail, getTempEmailsByPersonalEmail, getPersonalEmailByTempEmail, cleanupExpiredEmails } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database (in-memory for simplicity)
let emailMappings = {};

// Clean up expired emails every minute
setInterval(() => {
  cleanupExpiredEmails(emailMappings);
}, 60000);

// API Endpoints

/**
 * POST /api/generate
 * Generates a new temporary email for a personal email address
 * Body: { personalEmail: string }
 * Returns: { tempEmail: string, expiresIn: number (ms) }
 */
app.post('/api/generate', (req, res) => {
  const { personalEmail } = req.body;

  if (!personalEmail || !personalEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid personal email is required' });
  }

  const tempEmail = generateTempEmail();
  const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes from now

  // Store the mapping
  emailMappings[tempEmail] = {
    personalEmail,
    tempEmail,
    createdAt: Date.now(),
    expiresAt,
  };

  // Set up auto-delete timer for this email
  setTimeout(() => {
    if (emailMappings[tempEmail]) {
      delete emailMappings[tempEmail];
      console.log(`Temp email ${tempEmail} expired and was deleted`);
    }
  }, 30 * 60 * 1000);

  res.json({
    tempEmail,
    expiresIn: 30 * 60 * 1000, // 30 minutes in milliseconds
    expiresAt,
  });
});

/**
 * GET /api/lookup/personal
 * Get all temporary emails associated with a personal email
 * Query: { email: string }
 * Returns: { tempEmails: array of objects }
 */
app.get('/api/lookup/personal', (req, res) => {
  const { email } = req.query;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const tempEmails = getTempEmailsByPersonalEmail(email, emailMappings);

  res.json({ tempEmails });
});

/**
 * GET /api/lookup/temp
 * Get the personal email associated with a temporary email
 * Query: { email: string }
 * Returns: { personalEmail: string }
 */
app.get('/api/lookup/temp', (req, res) => {
  const { email } = req.query;

  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email is required' });
  }

  const personalEmail = getPersonalEmailByTempEmail(email, emailMappings);

  if (!personalEmail) {
    return res.status(404).json({ error: 'Temporary email not found or expired' });
  }

  res.json({ personalEmail });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve index.html for root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`MailVoid server running on http://localhost:${PORT}`);
  console.log('API endpoints:');
  console.log('  POST   /api/generate         - Generate a new temp email');
  console.log('  GET    /api/lookup/personal  - Get temp emails by personal email');
  console.log('  GET    /api/lookup/temp      - Get personal email by temp email');
});
