# Dynamic Mail Nodemailer

A Node.js project using Express and Nodemailer for sending dynamic emails with dynamic credentials.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure your `.env` file (optional - credentials can be sent in API request):
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)
- `SMTP_HOST`: Default SMTP server (optional, auto-detected from email domain)
- `SMTP_PORT`: Default SMTP port (optional, defaults to 587)

3. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /api/mail/send
Send an email with dynamic credentials.

**Request Body (JSON):**
```json
{
  "email": "sender@example.com",
  "appPassword": "your-app-password",
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<h1>This is a test email</h1>",
  "description": "This is the plain text version",
  "attachment": {
    "filename": "document.pdf",
    "content": "base64-encoded-content",
    "encoding": "base64"
  }
}
```

**Request Body (Form Data with File Upload):**
- `email`: Sender email address
- `appPassword`: Sender app password
- `to`: Recipient email (can be comma-separated for multiple recipients)
- `subject`: Email subject
- `html`: HTML content (optional)
- `description`: Plain text description (optional)
- `files`: File attachments (multipart/form-data)

**Supported Email Providers:**
- Gmail (gmail.com)
- Outlook/Hotmail (outlook.com, hotmail.com)
- Yahoo (yahoo.com, yahoo.co.uk)
- Custom SMTP (configured via .env)

**Response (Success):**
```json
{
  "success": true,
  "message": "Email sent successfully",
  "messageId": "<message-id>"
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "Failed to send email",
  "error": "Error message"
}
```

## Features

- ✅ Dynamic email credentials (sent with each request)
- ✅ Automatic SMTP configuration based on email domain
- ✅ Support for HTML and plain text emails
- ✅ File attachments (via multipart/form-data or base64)
- ✅ Multiple recipients support
- ✅ Automatic file cleanup after sending
