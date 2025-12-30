# MailVoid - Authentication & Updated Features

## New Features Added

### 1. **8-Digit Authentication Code**
- Login screen that requires an 8-digit access code
- Default code: `12345678` (changeable via `AUTH_CODE` environment variable)
- Sessions expire after 24 hours
- Token-based authentication for all API calls

### 2. **Manual Email Address Creation**
- In addition to random email generation
- Create custom email addresses with specific names
- Must follow format: `customname@mailvoid.win`
- Prevents duplicate email addresses

### 3. **Active Temporary Emails Dashboard**
- View all currently active temporary email addresses
- Shows creation time and time remaining (expiry countdown)
- Visual progress bar showing how close to expiration
- Quick copy button for each email
- Auto-refreshes every 10 seconds

## Updated Architecture

### Backend Changes

#### New Endpoints:
```
POST   /api/auth/login       - Authenticate with 8-digit code
POST   /api/auth/logout      - Invalidate current session
POST   /api/generate         - Generate random temp email (requires auth)
POST   /api/create-manual    - Create custom temp email (requires auth)
GET    /api/active-emails    - Get all active emails for user (requires auth)
GET    /api/lookup/personal  - Look up temp emails by personal email
GET    /api/lookup/temp      - Look up personal email by temp email
GET    /api/health           - Health check
```

#### Authentication Middleware:
```javascript
// Verify session token from Authorization header
function verifySession(req, res, next)
```

### Frontend Changes

#### Login Flow:
1. Page loads, checks for stored token in localStorage
2. If no token, shows login modal
3. User enters 8-digit code
4. Successfully authenticated users see main app
5. Logout clears token and returns to login screen

#### New UI Components:
- **Login Modal**: Centered login screen with code input
- **Manual Email Modal**: Form to create custom email addresses
- **Active Emails Section**: Grid/list view of all active temporary emails
- **Logout Button**: Header button for session management

## Environment Variables

```bash
# Authentication code (default: 12345678)
AUTH_CODE=12345678

# Server port
PORT=3000

# For Docker/Cloud deployment
API_ENDPOINT=https://api.mailvoid.win
```

## Usage Examples

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"code":"12345678"}'
```

Response:
```json
{
  "token": "hexadecimaltoken...",
  "message": "Authentication successful",
  "expiresIn": 86400000
}
```

### Generate Email (with token)
```bash
curl -X POST http://localhost:3000/api/generate \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hexadecimaltoken..." \
  -d '{"personalEmail":"user@example.com"}'
```

### Create Custom Email
```bash
curl -X POST http://localhost:3000/api/create-manual \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hexadecimaltoken..." \
  -d '{
    "personalEmail":"user@example.com",
    "customEmail":"myemail@mailvoid.win"
  }'
```

### Get Active Emails
```bash
curl -X GET http://localhost:3000/api/active-emails \
  -H "Authorization: Bearer hexadecimaltoken..."
```

## Security Features

✅ **Session-Based Authentication** - Tokens required for email operations
✅ **Token Expiration** - Automatic logout after 24 hours
✅ **CSRF Protection** - Via Bearer token mechanism
✅ **HTML Escaping** - Prevents XSS attacks
✅ **Input Validation** - All email inputs validated
✅ **Rate Limiting** - Can be added via middleware

## Running the Application

### Local Development
```bash
npm install
npm start
# Access at http://localhost:3000
# Login with code: 12345678
```

### Docker
```bash
docker-compose up
# Access at http://localhost:3000
```

### Changing the Authentication Code
```bash
# Local
export AUTH_CODE=99999999
npm start

# Docker
docker run -e AUTH_CODE=99999999 -p 3000:3000 mailvoid:latest
```

## File Structure

```
mailvoid/
├── public/
│   ├── index.html      # Updated with login modal & new sections
│   ├── styles.css      # New modal & active emails styles
│   └── app.js          # Complete rewrite with auth flow
├── src/
│   ├── server.js       # Updated with auth endpoints & middleware
│   └── emailService.js # Added isValidEmail function
├── Dockerfile
├── docker-compose.yml
├── wrangler.toml
├── email-worker.js
├── package.json
└── README.md
```

## Browser Support

All modern browsers supporting:
- localStorage API
- fetch API
- async/await
- ES6 modules

## Testing the Features

1. **Test Login:**
   - Open http://localhost:3000
   - Enter code: `12345678`
   - Should see main app

2. **Test Random Generation:**
   - Enter personal email
   - Click "Generate Random Email"
   - Email should appear with 30-minute countdown

3. **Test Custom Creation:**
   - Enter personal email
   - Click "Create Custom Email"
   - Enter `test@mailvoid.win`
   - Should create custom email

4. **Test Active Emails:**
   - Generate 2-3 temporary emails
   - All should appear in "Active Temporary Emails" section
   - See countdown timers and copy buttons

5. **Test Logout:**
   - Click "Logout" button
   - Should return to login screen
   - localStorage token should be cleared

## Future Enhancements

- [ ] Multi-user support with real user database
- [ ] Email forwarding integration
- [ ] Admin dashboard
- [ ] Rate limiting per IP
- [ ] Webhook support for incoming emails
- [ ] API key management
- [ ] Usage analytics
- [ ] Premium features
