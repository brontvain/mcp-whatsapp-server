# MCP WhatsApp Server

A WhatsApp server that automatically responds to messages from a specific contact using AI. Features a modern web UI for configuration and monitoring.

## Features

- 🤖 AI-powered responses using OpenAI's GPT-3.5
- 📱 WhatsApp integration using whatsapp-web.js
- 🎨 Modern web UI for configuration
- 🔄 Real-time status monitoring
- 📝 Editable AI context
- 🔐 QR code authentication
- 🐳 Docker support

## Prerequisites

- Node.js 18 or higher
- Docker (optional)
- OpenAI API key

## Setup

### Environment Variables

Create a `.env` file in the root directory:

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=3000  # optional, defaults to 3000
```

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the server:**
   ```bash
   npm start
   ```

3. **Access the UI:**
   Open your browser to `http://localhost:3000`

### Docker Deployment

1. **Build the Docker image:**
   ```bash
   docker build -t whatsapp-server .
   ```

2. **Run the container:**
   ```bash
   docker run -p 3000:3000 \
     -e OPENAI_API_KEY=your_openai_api_key_here \
     whatsapp-server
   ```

## Web UI Features

The web interface provides:

- **Phone Number Configuration**
  - Set the target WhatsApp contact number
  - Format: country code + number (e.g., 14254572311)

- **AI Context Editor**
  - Edit the AI assistant's behavior and responses
  - Save changes in real-time

- **WhatsApp Status**
  - Real-time connection status
  - QR code display for authentication
  - Connection monitoring

## Usage

1. **Initial Setup:**
   - Start the server
   - Access the web UI at `http://localhost:3000`
   - Configure the target phone number
   - Customize the AI context if needed

2. **WhatsApp Authentication:**
   - When prompted, scan the QR code with your WhatsApp
   - The server will maintain the session for future use

3. **Monitoring:**
   - Watch the connection status in the UI
   - View real-time updates about the server state

## Directory Structure

```
.
├── contexts/           # AI context files
│   └── default.txt    # Default context
├── public/            # Web UI files
│   └── index.html     # Main UI
├── .env              # Environment variables
├── index.js          # Main server code
├── package.json      # Dependencies
└── Dockerfile        # Docker configuration
```

## Troubleshooting

### Common Issues

1. **WhatsApp Authentication:**
   - If the QR code doesn't appear, refresh the page
   - Ensure your WhatsApp is properly installed and running

2. **Docker Issues:**
   - If running in Docker, ensure proper port mapping
   - Check environment variables are properly set

3. **AI Responses:**
   - Verify your OpenAI API key is valid
   - Check the context file for proper formatting

## Security Notes

- Never commit your `.env` file
- Keep your OpenAI API key secure
- The WhatsApp session is stored locally
- Use HTTPS in production

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the LICENSE file for details.
