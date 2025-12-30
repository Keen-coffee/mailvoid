# MailVoid

A temporary email service built with Next.js.

## Features

- Generate temporary email addresses with random words and digits.
- Options for 10-minute or unlimited expiration.
- API endpoint to receive emails via PUT requests (for Cloudflare Email Worker).
- View received emails.

## Setup

1. Clone the repository.
2. Install dependencies: `npm install`
3. Run development server: `npm run dev`
4. Open http://localhost:3000

## Docker

Build the Docker image:
```
docker build -t mailvoid .
```

Run the container:
```
docker run -p 3000:3000 mailvoid
```

## API Endpoints

- `POST /api/generate`: Generate a new email address. Body: `{ "duration": "10min" | "unlimited" }`
- `PUT /api/endpoint`: Receive an email from Cloudflare Email Worker. Expects `ForwardableEmailMessage` format with `from`, `to`, and `raw` fields.
- `POST /api/emails`: Get received emails for an address. Body: `{ "email": "address" }`

## Cloudflare Email Worker

The `email-worker.js` file contains the Cloudflare Email Worker code that forwards incoming emails to the MailVoid API.

### Deployment Steps:

1. **Install Wrangler CLI** (if not already installed):
   ```
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```
   wrangler auth login
   ```

3. **Create a new Email Worker**:
   ```
   wrangler init mailvoid-worker --type email
   ```
   Or deploy directly:
   ```
   wrangler deploy email-worker.js
   ```

4. **Configure Email Routing**:
   - Go to Cloudflare Dashboard > Email > Email Routing
   - Set up routing rules to direct emails to your worker
   - Ensure MX records point to Cloudflare

5. **Update the worker URL**:
   - Edit `email-worker.js` and replace `'https://yourdomain.com/api/endpoint'` with your actual deployed API URL (e.g., `'https://mailvoid.win/api/endpoint'`)

### Worker Code Overview:
The worker receives the `ForwardableEmailMessage` from Cloudflare and forwards it as a PUT request to the MailVoid API, including the raw email content for proper parsing.

## Domain

The emails are @mailvoid.win, so you need to own that domain and set up MX records to point to Cloudflare Email Routing.