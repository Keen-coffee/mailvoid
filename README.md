# MailVoid - Temporary Email Generator

A simple web application for generating and managing temporary email addresses that automatically expire after 30 minutes.

## Features

- **Generate Temporary Emails**: Create random email addresses in the format `randomword.randomword4randomdigits@mailvoid.win`
- **Personal Email Required**: You must enter your personal email address before generating temporary emails
- **30-Minute Expiration**: All temporary emails are automatically deleted after 30 minutes
- **Email Lookup**: 
  - Look up all temporary emails associated with a personal email address
  - Look up the personal email address associated with a temporary email address
- **Automatic Cleanup**: Expired emails are automatically removed from the system
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Prerequisites

### Option 1: Local Installation
- Node.js (v14 or higher)
- npm (comes with Node.js)

### Option 2: Docker
- Docker (v20 or higher)
- Docker Compose (optional but recommended)

## Installation & Running

### Option 1: Run Locally

1. Navigate to the project directory:
```bash
cd mailvoid
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

The application will be available at:
```
http://localhost:3000
```

### Option 2: Run with Docker

#### Using Docker Compose (Recommended)

1. Make sure Docker and Docker Compose are installed

2. Navigate to the project directory:
```bash
cd mailvoid
```

3. Start the container:
```bash
docker-compose up
```

The application will be available at:
```
http://localhost:3000
```

To stop the container:
```bash
docker-compose down
```

#### Using Docker CLI

1. Build the image:
```bash
docker build -t mailvoid:latest .
```

2. Run the container:
```bash
docker run -p 3000:3000 --name mailvoid-app mailvoid:latest
```

3. Access the application at:
```
http://localhost:3000
```

4. To stop the container:
```bash
docker stop mailvoid-app
```

5. To remove the container:
```bash
docker rm mailvoid-app
```

#### Docker Configuration

The Docker setup includes:
- **Image**: Node.js 18 Alpine (lightweight)
- **Port**: 3000 (exposed)
- **Health Check**: Automatic health monitoring
- **Auto Restart**: Container restarts automatically on failure

View logs from Docker container:
```bash
docker logs mailvoid-app
```

## Project Structure

```
mailvoid/
├── public/
│   ├── index.html      # Main HTML file
│   ├── styles.css      # Styling
│   └── app.js          # Frontend JavaScript
├── src/
│   ├── server.js       # Express server and API endpoints
│   └── emailService.js # Email generation and management logic
├── package.json        # Project dependencies
└── README.md           # This file
```

## API Endpoints

### Generate Temporary Email
**POST** `/api/generate`

Request:
```json
{
  "personalEmail": "your@email.com"
}
```

Response:
```json
{
  "tempEmail": "swift.tiger1234@mailvoid.win",
  "expiresIn": 1800000,
  "expiresAt": 1704067200000
}
```

### Look Up by Personal Email
**GET** `/api/lookup/personal?email=your@email.com`

Response:
```json
{
  "tempEmails": [
    {
      "personalEmail": "your@email.com",
      "tempEmail": "swift.tiger1234@mailvoid.win",
      "createdAt": 1704065400000,
      "expiresAt": 1704067200000
    }
  ]
}
```

### Look Up by Temporary Email
**GET** `/api/lookup/temp?email=swift.tiger1234@mailvoid.win`

Response:
```json
{
  "personalEmail": "your@email.com"
}
```

### Health Check
**GET** `/api/health`

Response:
```json
{
  "status": "ok"
}
```

## How It Works

1. **Enter Personal Email**: Start by entering your personal email address in the generate section
2. **Generate Email**: Click "Generate Temporary Email" to create a new temporary email
3. **Copy Email**: Use the "Copy to Clipboard" button to copy the temporary email
4. **Track Expiration**: The expiry timer shows when your temporary email will be automatically deleted
5. **Look Up Emails**: Use the lookup section to find relationships between personal and temporary emails

### Automatic Deletion

- Each temporary email is automatically deleted **30 minutes** after creation
- The system performs cleanup checks every minute
- Expired emails are immediately inaccessible via the API

## Data Storage

The application uses **in-memory storage** for temporary email mappings. This means:
- All data is lost when the server restarts
- Perfect for temporary, non-persistent use
- No database setup required

## Browser Compatibility

- Chrome/Chromium (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Development

To modify the word lists for email generation, edit the `adjectives` and `nouns` arrays in `src/emailService.js`.

Example:
```javascript
const adjectives = ['swift', 'bright', 'calm', ...];
const nouns = ['panda', 'tiger', 'eagle', ...];
```

## Security Note

This is a demonstration application. For production use, consider:
- Implementing proper authentication
- Using a persistent database
- Adding rate limiting
- Validating email addresses with verification codes
- Using HTTPS/TLS encryption

## Docker Troubleshooting

**Container won't start:**
```bash
docker logs mailvoid-app
```

**Port already in use:**
```bash
docker run -p 8000:3000 --name mailvoid-app mailvoid:latest
# Then access at http://localhost:8000
```

**Remove all containers and images:**
```bash
docker-compose down
docker rmi mailvoid:latest
```

## License

This project is open source and available under the MIT License.

## Author

Created as a temporary email service demonstration.
