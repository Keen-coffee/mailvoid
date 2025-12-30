const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { generateTempEmail, getTempEmailsByPersonalEmail, getPersonalEmailByTempEmail, cleanupExpiredEmails, isValidEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Authentication
const AUTH_CODE = process.env.AUTH_CODE || '12345678'; // 8-digit code, changeable via env var
const sessions = {}; // Store active sessions

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../public')));

// Database (in-memory for simplicity)
let emailMappings = {};

/**
 * Middleware to verify session token
 */
function verifySession(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token || !sessions[token]) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }
  
  req.sessionToken = token;
  req.personalEmail = sessions[token];
  next();
}

// Clean up expired emails every minute
setInterval(() => {
  cleanupExpiredEmails(emailMappings);
}, 60000);

// API Endpoints

/**
 * POST /api/auth/login
 * Verify the 8-digit authentication code and create a session
 * Body: { code: string }
 * Returns: { token: string, message: string }
 */
app.post('/api/auth/login', (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'Code is required' });
  }

  if (code === AUTH_CODE) {
    // Generate a unique session token
    const token = require('crypto').randomBytes(32).toString('hex');
    sessions[token] = Date.now();

    // Token expires in 24 hours
    setTimeout(() => {
      delete sessions[token];
    }, 24 * 60 * 60 * 1000);

    return res.json({
      token,
      message: 'Authentication successful',
      expiresIn: 24 * 60 * 60 * 1000,
    });
  }

  res.status(401).json({ error: 'Invalid authentication code' });
});

/**
 * POST /api/auth/logout
 * Logout and invalidate session
 * Headers: { Authorization: "Bearer token" }
 */
app.post('/api/auth/logout', verifySession, (req, res) => {
  delete sessions[req.sessionToken];
  res.json({ message: 'Logged out successfully' });
});

/**
 * POST /api/generate
 * Generates a new temporary email (forwards to sean@fourteen10.com)
 * Body: { }
 * Headers: { Authorization: "Bearer token" }
 * Returns: { tempEmail: string, expiresIn: number (ms) }
 */
app.post('/api/generate', verifySession, (req, res) => {
  const personalEmail = 'sean@fourteen10.com';

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
 * POST /api/create-manual
 * Manually create a temporary email with a custom format (forwards to sean@fourteen10.com)
 * Body: { customEmail: string }
 * Headers: { Authorization: "Bearer token" }
 * Returns: { tempEmail: string, expiresIn: number (ms) }
 */
app.post('/api/create-manual', verifySession, (req, res) => {
  const { customEmail } = req.body;
  const personalEmail = 'sean@fourteen10.com';

  if (!customEmail || !customEmail.includes('@')) {
    return res.status(400).json({ error: 'Valid custom email is required' });
  }

  // Check if email already exists
  if (emailMappings[customEmail.toLowerCase()]) {
    return res.status(400).json({ error: 'This email address already exists' });
  }

  const tempEmail = customEmail.toLowerCase();
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
 * GET /api/active-emails
 * Get all active temporary emails (no personal email lookup needed)
 * Headers: { Authorization: "Bearer token" }
 * Returns: { tempEmails: array of objects }
 */
app.get('/api/active-emails', verifySession, (req, res) => {
  const now = Date.now();
  const tempEmails = Object.values(emailMappings).filter(mapping => {
    return mapping.expiresAt > now;
  });

  res.json({ tempEmails });
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
  console.log('  POST   /api/auth/login       - Login with 8-digit code');
  console.log('  POST   /api/auth/logout      - Logout');
  console.log('  POST   /api/generate         - Generate a new temp email');
  console.log('  POST   /api/create-manual    - Create a custom temp email');
  console.log('  GET    /api/active-emails    - Get all active temp emails');
  console.log('  GET    /api/lookup/personal  - Get temp emails by personal email');
  console.log('  GET    /api/lookup/temp      - Get personal email by temp email');
});
