# MailVoid Quick Start Guide

## What Changed?

Your MailVoid application now has:

✅ **8-Digit Authentication Code** - Required login before generating emails
✅ **Random Email Generation** - Auto-generated email addresses
✅ **Custom Email Creation** - Create emails with your own names
✅ **Active Emails Dashboard** - See all your current temporary emails with countdown timers
✅ **Session Management** - Logout functionality

## How to Use

### Step 1: Login
1. Open http://localhost:3000
2. Enter the 8-digit code: **12345678**
3. Click "Login" or press Enter

### Step 2: Generate Emails

#### Option A: Generate Random Email
1. Enter your personal email address
2. Click "Generate Random Email"
3. A random email like `swift.tiger1234@mailvoid.win` will be created
4. Copy it using the "Copy to Clipboard" button
5. View countdown timer (30 minutes to expiration)

#### Option B: Create Custom Email
1. Enter your personal email address
2. Click "Create Custom Email"
3. Enter your desired email name (must end with @mailvoid.win)
4. Example: `myname@mailvoid.win`
5. Click "Create Email"

### Step 3: View Active Emails
- Scroll down to "Active Temporary Emails" section
- See all your active temporary email addresses
- View creation time and time remaining
- Quick copy button for each email
- Emails automatically refresh every 10 seconds

### Step 4: Look Up Emails (Optional)
**By Personal Email:**
- Enter your personal email
- See all temp emails associated with it

**By Temporary Email:**
- Enter a temp email
- See which personal email it maps to

### Step 5: Logout
- Click the "Logout" button in the top-right
- Returns to login screen
- Session token is cleared

## Settings

### Change Authentication Code

**Local:**
```bash
export AUTH_CODE=12345678
npm start
```

**Docker:**
```bash
docker run -e AUTH_CODE=12345678 -p 3000:3000 mailvoid:latest
```

## How It Works

1. **You log in** with the 8-digit code
2. **You generate** either random or custom temporary emails
3. **Your temporary emails** are stored with your personal email
4. **After 30 minutes** temporary emails are automatically deleted
5. **You can look up** relationships between temporary and personal emails

## Tips & Tricks

💡 **Copy Multiple Emails** - Click the "Copy" button on any active email
💡 **Quick Generation** - Press Enter after entering email to generate
💡 **Auto-Refresh** - Active emails list refreshes every 10 seconds automatically
💡 **Stay Organized** - Use custom emails to create memorable addresses
💡 **Monitor Expiry** - Watch the progress bar to see when emails expire

## Endpoints (API)

If you want to integrate with external apps:

```
POST   /api/auth/login              Login with code
POST   /api/auth/logout             Logout
POST   /api/generate                Generate random email
POST   /api/create-manual           Create custom email
GET    /api/active-emails           List all active emails
GET    /api/lookup/personal         Find emails by personal email
GET    /api/lookup/temp             Find personal email by temp email
```

All endpoints except `/auth/login` require:
```
Authorization: Bearer <token>
```

## Troubleshooting

**Q: I forgot the code**
A: Default code is `12345678`. Check AUTHENTICATION.md for how to change it.

**Q: My email expired**
A: Temporary emails last 30 minutes. Generate a new one.

**Q: Can I customize the code?**
A: Yes! Set `AUTH_CODE` environment variable or change in `src/server.js`

**Q: Does my data persist?**
A: No, data is in-memory. Restarts clear everything. For production, add a database.

**Q: Can multiple users use this?**
A: Currently it's a single-user system. Each person needs their own instance.

## Next Steps

1. Run the application
2. Test the login flow
3. Generate random and custom emails
4. View the active emails dashboard
5. Test logout and login again

---

**Need help?** Check [AUTHENTICATION.md](AUTHENTICATION.md) or [README.md](README.md) for more details.
