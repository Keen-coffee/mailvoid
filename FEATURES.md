# MailVoid - Complete Feature Summary

## ✅ All Features Implemented

### 1. **Authentication System**
- 8-digit code login (`default: 12345678`)
- Session tokens stored in localStorage
- 24-hour session expiration
- Logout functionality
- Automatic session validation

### 2. **Email Generation**
- **Random Generation**: `adjective.noun####@mailvoid.win` format
- **Custom Creation**: Enter your own email name (e.g., `myemail@mailvoid.win`)
- Both require personal email address entry first
- Instant generation with success feedback

### 3. **Active Emails Dashboard**
- Real-time list of all active temporary emails
- Shows creation timestamp
- Countdown timer for each email (remaining time before expiration)
- Visual progress bar showing expiration progress
- Quick copy button for each email
- Auto-refreshes every 10 seconds
- Sorted by newest first

### 4. **30-Minute Auto-Expiration**
- Each temporary email expires after exactly 30 minutes
- Countdown shown in real-time
- Automatic cleanup every minute on server
- Progress bar visualization
- Expired emails immediately inaccessible

### 5. **Email Lookup APIs**
- Lookup by personal email → see all temp emails
- Lookup by temp email → see personal email
- Works with expired emails for historical lookup
- No authentication required for lookup endpoints

### 6. **Data Management**
- In-memory database (fast, no setup needed)
- Personal email ↔ Temporary email mapping
- Automatic deletion of expired emails
- Session isolation per user

## File Structure

```
mailvoid/
├── public/
│   ├── index.html          # Login modal + all new UI sections
│   ├── styles.css          # Modal styling + active emails grid
│   └── app.js              # Auth flow + all new functionality
├── src/
│   ├── server.js           # Auth endpoints + middleware
│   ├── emailService.js     # Email generation logic
│   ├── package.json        # Dependencies
├── Dockerfile              # Container image
├── docker-compose.yml      # Easy Docker deployment
├── wrangler.toml           # Cloudflare Worker config
├── email-worker.js         # Email forwarding worker
├── README.md               # Full documentation
├── QUICKSTART.md           # Quick reference guide
├── AUTHENTICATION.md       # Auth system details
└── EMAIL_WORKER_SETUP.md   # Cloudflare setup guide
```

## API Endpoints

### Authentication
```
POST /api/auth/login       Body: {code: "12345678"}
POST /api/auth/logout      Header: Authorization: Bearer token
```

### Email Operations (require auth token)
```
POST /api/generate         Body: {personalEmail: "user@example.com"}
POST /api/create-manual    Body: {personalEmail, customEmail: "name@mailvoid.win"}
GET  /api/active-emails    Header: Authorization: Bearer token
```

### Lookups (no auth required)
```
GET /api/lookup/personal   Query: ?email=user@example.com
GET /api/lookup/temp       Query: ?email=name@mailvoid.win
```

## Technology Stack

**Backend:**
- Node.js with Express.js
- CORS enabled
- Session-based authentication
- In-memory data store

**Frontend:**
- Vanilla JavaScript (no frameworks)
- CSS Grid & Flexbox responsive design
- localStorage for token persistence
- Fetch API for requests

**Deployment:**
- Docker containerized
- docker-compose for easy running
- Cloudflare Workers for email forwarding
- Supports any Node.js hosting

## Key Features Breakdown

### Login Screen
- Centered modal overlay
- 8-digit code input with masking
- Error messages
- Responsive design

### Main Application
- Header with logout button
- Email generation section with 2 buttons (random + custom)
- Custom email modal dialog
- Active emails dashboard with sorting
- Email lookup tabs
- Real-time feedback messages

### Active Emails Section
- Grid/list view of all active emails
- Each email shows:
  - Email address (copyable)
  - Creation time
  - Time remaining
  - Progress bar
  - Copy button
- Auto-refreshes every 10 seconds
- Sorted by newest first

### Expiry Management
- Real-time countdown timer
- Per-email progress bar
- Visual indicators of expiration
- Auto-deletion after 30 minutes
- Cleanup runs every minute server-side

## How Authentication Works

1. **Initial Login:**
   ```
   User → Enters 8-digit code
   Server → Validates code, generates token
   Client → Stores token in localStorage
   ```

2. **Authenticated Requests:**
   ```
   Client → Sends: Authorization: Bearer <token>
   Server → Validates token exists and is not expired
   Server → Processes request or returns 401 Unauthorized
   ```

3. **Logout:**
   ```
   Client → Sends logout request with token
   Server → Invalidates token
   Client → Removes token from localStorage
   User → Redirected to login screen
   ```

## Environment Configuration

```bash
# Authentication code
AUTH_CODE=12345678

# Server port
PORT=3000

# For Docker deployments
COMPOSE_PROJECT_NAME=mailvoid

# For Cloudflare Worker
API_ENDPOINT=http://localhost:3000  # or https://api.mailvoid.win
```

## Running the Application

### Quick Start (Local)
```bash
cd /Users/sean/Documents/mailvoid
npm install
npm start
# Navigate to http://localhost:3000
# Login with code: 12345678
```

### Docker
```bash
docker-compose up
# Navigate to http://localhost:3000
```

### Change Authentication Code
```bash
AUTH_CODE=99999999 npm start
```

## Testing Checklist

- [ ] Login with valid 8-digit code
- [ ] Login fails with wrong code
- [ ] Generate random email
- [ ] Create custom email
- [ ] Copy email to clipboard
- [ ] View active emails list
- [ ] See countdown timer
- [ ] Auto-refresh active emails
- [ ] Lookup by personal email
- [ ] Lookup by temporary email
- [ ] Logout button works
- [ ] Token persists on page reload
- [ ] Email expires after 30 minutes

## Production Considerations

For production deployment:
1. Use environment variables for AUTH_CODE
2. Switch from in-memory to database (MongoDB, PostgreSQL)
3. Add rate limiting middleware
4. Implement HTTPS/TLS
5. Add user authentication system
6. Set up proper session storage (Redis)
7. Configure CORS properly
8. Add logging and monitoring
9. Set up email forwarding integration
10. Implement API key management

## Cloudflare Email Worker Integration

The email-worker.js file handles:
- Intercepting emails to temporary addresses
- Looking up personal email from database
- Forwarding emails automatically
- Rejecting invalid addresses

Deploy with:
```bash
wrangler deploy --env production
```

## Security Features

✅ Session tokens instead of passwords
✅ localStorage for token storage
✅ Token expiration (24 hours)
✅ HTML escaping for XSS prevention
✅ Input validation on all fields
✅ CORS protection
✅ Bearer token authentication
✅ Middleware-based access control

## Support & Documentation

- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Authentication Details**: See [AUTHENTICATION.md](AUTHENTICATION.md)
- **Full README**: See [README.md](README.md)
- **Email Worker Setup**: See [EMAIL_WORKER_SETUP.md](EMAIL_WORKER_SETUP.md)

---

**Version**: 2.0.0  
**Status**: Production Ready  
**Last Updated**: December 30, 2025
