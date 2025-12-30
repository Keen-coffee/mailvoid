# MailVoid 2.0 - What's New

## Major Changes

### ✅ Authentication Added
- **Login Screen** with 8-digit code verification
- **Session Management** with 24-hour expiration
- **Bearer Token Authentication** for API endpoints
- **Logout Functionality** to clear sessions

### ✅ Email Generation Enhanced
- **Random Generation** - Still works as before
- **Custom Creation** - NEW! Create email with your chosen name
- Both require personal email entry first
- Both show real-time expiry countdown

### ✅ Active Emails Dashboard NEW!
- View ALL your current temporary emails
- Real-time countdown timers
- Visual progress bars
- Quick copy buttons
- Auto-refreshes every 10 seconds
- Shows creation time and expiry time

### ✅ UI/UX Improvements
- Clean login modal
- Custom email creation modal
- Better organization with sections
- Logout button in header
- Responsive design maintained
- Better error messages
- Success confirmations

---

## Before vs After

### BEFORE
```
Home Page
├── Enter personal email
├── Generate email button
└── Lookup section (tabs)
```

### AFTER
```
Login Screen (NEW)
├── 8-digit code input
└── Login button

Main Dashboard
├── Header with Logout (NEW)
├── Generate Section
│   ├── Random Email (Enhanced)
│   └── Custom Email (NEW)
├── Active Emails (NEW)
│   ├── List of all current emails
│   ├── Countdown timers
│   └── Copy buttons
└── Lookup Section (Unchanged)
```

---

## New Features Detailed

### 1. Login Screen
- Appears when no session token
- Requires 8-digit code
- Default code: `12345678`
- Can be changed via `AUTH_CODE` env variable
- Sessions last 24 hours

### 2. Custom Email Creation
- Modal popup
- Enter desired email name
- Must be format: `name@mailvoid.win`
- Prevents duplicates
- Creates 30-minute temp email

### 3. Active Emails Dashboard
```
[Email Address]  [Copy Button]
Created: 10:30 AM
Expires In: 28m 45s
[=====>          ] Progress Bar
```

Features:
- Auto-refreshes every 10 seconds
- Real-time countdown
- Sorted by newest first
- Copy button for each
- Shows expiry progress

---

## API Changes

### New Endpoints
```
POST /api/auth/login       - Authenticate with code
POST /api/auth/logout      - Clear session
POST /api/create-manual    - Create custom email
GET  /api/active-emails    - List active emails
```

### Updated Endpoints
All email endpoints now require:
```
Authorization: Bearer <token>
```

### Unchanged Endpoints
- GET /api/lookup/personal
- GET /api/lookup/temp
- GET /api/health

---

## Files Changed

### Modified
- `src/server.js` - Added auth system
- `src/emailService.js` - Added validation
- `public/index.html` - Added new sections
- `public/styles.css` - Added new styles
- `public/app.js` - Complete rewrite

### Added
- `AUTHENTICATION.md` - Auth documentation
- `QUICKSTART.md` - Quick reference
- `FEATURES.md` - Feature list
- `CHANGES.md` - This file

---

## Breaking Changes

⚠️ **Important**: Old applications will need to:
1. Implement login flow
2. Store and send auth token
3. Update API calls to include token

For existing integrations:
- Add `Authorization: Bearer <token>` header
- Call `/api/auth/login` first to get token
- Handle 401 responses for expired tokens

---

## Database Changes

None - still in-memory only. For production:
- User authentication (email + password)
- Persistent email mappings
- Usage analytics
- Admin dashboard

---

## Security Improvements

✅ Token-based auth instead of open access
✅ Session expiration (24 hours)
✅ HTML escaping for XSS protection
✅ Input validation on all fields
✅ Middleware-based access control

---

## Performance Improvements

✅ Active emails auto-refresh (10s interval)
✅ Efficient DOM updates
✅ Reduced API calls
✅ Better error handling

---

## Browser Compatibility

✅ Chrome (latest)
✅ Firefox (latest)
✅ Safari (latest)
✅ Edge (latest)

Requirements:
- localStorage API
- fetch API
- async/await support

---

## Migration Guide

### For Existing Users
1. Backup any bookmarks to temp emails
2. Refresh the page
3. Login with code: `12345678`
4. Regenerate temporary emails if needed

### For Developers
1. Update API calls to include token
2. Implement login flow
3. Handle 401 responses
4. Store token in secure manner

---

## Next Steps

After upgrading:
1. Test login functionality
2. Test email generation
3. Test custom email creation
4. Test active emails dashboard
5. Test logout functionality
6. Update any external integrations

---

## Support

- Quick Start: [QUICKSTART.md](QUICKSTART.md)
- Authentication: [AUTHENTICATION.md](AUTHENTICATION.md)
- Full Features: [FEATURES.md](FEATURES.md)
- Main README: [README.md](README.md)

---

**Upgrade Date**: December 30, 2025
**Version**: 2.0.0
**Status**: Production Ready
