# MailVoid Email Worker Setup Guide

This guide walks you through setting up the Cloudflare Email Worker to automatically forward emails sent to temporary MailVoid email addresses to your personal email.

## Prerequisites

- A Cloudflare account with a domain
- Cloudflare Email Routing enabled (available on paid plans)
- Node.js and npm installed
- Wrangler CLI installed (`npm install -g wrangler`)

## How It Works

1. Someone sends an email to a temporary address (e.g., `swift.tiger1234@mailvoid.win`)
2. Cloudflare Email Routing intercepts the email
3. The email worker checks if this temp email exists in the MailVoid database
4. If found, the email is forwarded to your personal email address
5. If not found or expired, the email is rejected

## Setup Steps

### Step 1: Install Wrangler CLI

```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### Step 3: Configure Your Domain

Ensure Email Routing is enabled on your Cloudflare domain:

1. Log in to Cloudflare Dashboard
2. Select your domain
3. Go to **Email > Email Routing**
4. Click **Enable Email Routing**
5. Create a routing rule:
   - **From**: `*@yourdomain.com` (or use `@mailvoid.win` if using that domain)
   - **To**: Your email worker route
   - **Action**: Forward to worker

### Step 4: Update Configuration

Edit `wrangler.toml` to match your setup:

```toml
[env.production]
vars = { API_ENDPOINT = "https://your-api-domain.com" }
```

Replace `https://your-api-domain.com` with:
- Your production MailVoid API URL (if deployed to the cloud)
- Or use ngrok/tunneling if running locally: `https://your-tunnel.ngrok.io`

### Step 5: Deploy the Worker

```bash
# Deploy to production environment
wrangler deploy --env production

# Or deploy to development
wrangler deploy --env development
```

### Step 6: Configure Cloudflare Email Routing

In the Cloudflare Dashboard:

1. Go to **Email > Email Routing > Routes**
2. Create a new route:
   - **Catch-all address**: `*@yourdomain.com`
   - **Route to**: Select your deployed email worker
3. Save the route

## Testing

### Test Locally

Use a tool like Mailhog or test email service:

```bash
# Start your MailVoid app
npm start

# Generate a temporary email through the web interface
# Example: swift.tiger1234@mailvoid.win with personal email: your@email.com

# Send a test email to that temporary address
# The email should appear in your inbox
```

### Test in Production

1. Generate a temporary email through the MailVoid web interface
2. Send an email to that temporary address
3. Check your personal email inbox
4. The email should appear within seconds

## Environment Variables

Configure these in Cloudflare Workers:

- **API_ENDPOINT**: The URL of your MailVoid API server
  - Production: `https://api.mailvoid.win`
  - Development: `http://localhost:3000`

## Troubleshooting

### Worker Not Triggering

- Check Email Routing is enabled in Cloudflare Dashboard
- Verify the routing rule is pointing to your worker
- Check worker logs in Cloudflare Dashboard

### "API Endpoint not found" Error

- Ensure API_ENDPOINT environment variable is set correctly
- Verify the MailVoid API is running and accessible
- Check firewall rules if using cloud deployment

### Email Not Forwarding

- Verify the temporary email exists in the MailVoid database
- Check if the email hasn't expired (30-minute limit)
- Review worker logs for error messages

### View Worker Logs

```bash
wrangler tail
```

This will stream real-time logs from your deployed worker.

## Worker Code Structure

The worker performs these steps:

1. **Extract Temp Email**: Gets the "to" address from the incoming email
2. **API Lookup**: Calls `/api/lookup/temp` to find the personal email
3. **Forward or Reject**: 
   - If found: Forwards to the personal email
   - If not found or expired: Rejects with an error message

## Security Considerations

- The worker only forwards valid, registered temporary emails
- Emails to unregistered or expired temp addresses are rejected
- All communication with the API can use HTTPS
- API endpoint should be protected if deployed to public cloud

## Advanced Configuration

### Using Custom Domain

To use a custom domain like `mail.yourdomain.com`:

1. Update `wrangler.toml`:
```toml
[[routes]]
pattern = "mail.yourdomain.com/*"
zone_name = "yourdomain.com"
```

2. Configure Cloudflare Email Routing for `@yourdomain.com`

### Rate Limiting

To add rate limiting to prevent abuse:

```javascript
// Add this to the worker
const rateLimitMap = new Map();

function checkRateLimit(email) {
  const now = Date.now();
  const lastTime = rateLimitMap.get(email) || 0;
  
  if (now - lastTime < 60000) { // 1 email per minute
    return false;
  }
  
  rateLimitMap.set(email, now);
  return true;
}
```

## Monitoring

Monitor email forwarding activity:

1. **Cloudflare Dashboard**: View worker analytics
2. **Worker Logs**: Real-time logs with `wrangler tail`
3. **MailVoid Logs**: Check your API server logs for temp email lookups

## Deployment to Production

### Using a Cloud Provider

1. **Deploy MailVoid API** to a cloud provider:
   - Heroku
   - Railway
   - Render
   - AWS Lambda
   - Google Cloud Run

2. **Update Environment Variable**:
```bash
wrangler secret put API_ENDPOINT
# Enter: https://your-production-api.com
```

3. **Deploy Worker**:
```bash
wrangler deploy --env production
```

## Rollback

If something goes wrong:

```bash
# Redeploy previous version
wrangler deploy --env development
```

## Support

For issues:
1. Check Cloudflare Dashboard > Email > Email Routing > Activity
2. View worker logs: `wrangler tail`
3. Verify API is accessible: `curl https://api.mailvoid.win/api/health`

---

**Last Updated**: December 30, 2025
