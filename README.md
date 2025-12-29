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
- `PUT /api/endpoint`: Receive an email. Body: `{ "to": "email", "from": "sender", "subject": "subj", "text": "body" }`
- `POST /api/emails`: Get received emails for an address. Body: `{ "email": "address" }`

## Cloudflare Email Worker

Configure your Cloudflare Email Worker to send PUT requests to `https://yourdomain.com/api/endpoint` with the email data in JSON format.

## Domain

The emails are @mailvoid.win, so you need to own that domain and set up MX records to point to Cloudflare Email Routing.