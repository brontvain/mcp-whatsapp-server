require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static('public'));
app.use('/contexts', express.static('contexts'));
app.use(express.json());

// Default settings
let CONTACT_PHONE_NUMBER = '14254572311';
let CONTEXT_FILE = 'contexts/default.txt';

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

// Function to load context from file
async function loadContext(contextFile = CONTEXT_FILE) {
    try {
        const contextPath = path.join(process.cwd(), contextFile);
        const context = await fs.readFile(contextPath, 'utf8');
        return context.trim();
    } catch (error) {
        console.error('Error loading context file:', error);
        return 'You are a helpful assistant responding to WhatsApp messages. Keep responses concise and friendly.';
    }
}

// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
    
    // Emit QR code to connected clients
    io.emit('qr', `data:image/png;base64,${qr}`);
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
    io.emit('status', { connected: true, message: 'WhatsApp client is connected and ready!' });
});

client.on('disconnected', () => {
    console.log('WhatsApp client disconnected');
    io.emit('status', { connected: false, message: 'WhatsApp client disconnected. Please scan QR code to reconnect.' });
});

client.on('message', async msg => {
    const sender = msg.from;
    if (sender.endsWith('@c.us')) {
        const senderNumber = sender.replace('@c.us', '');
        if (senderNumber === CONTACT_PHONE_NUMBER) {
            try {
                const context = await loadContext();
                
                const completion = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "system",
                            content: context
                        },
                        {
                            role: "user",
                            content: msg.body
                        }
                    ],
                    max_tokens: 150
                });

                const response = completion.choices[0].message.content;
                await msg.reply(response);
                console.log(`Auto-replied to ${senderNumber} with AI-generated response`);
            } catch (error) {
                console.error('Error generating AI response:', error);
                await msg.reply('Sorry, I encountered an error while generating a response.');
            }
        }
    }
});

// Start WhatsApp client
client.initialize();

// API Endpoints
app.get('/get-settings', (req, res) => {
    res.json({
        phoneNumber: CONTACT_PHONE_NUMBER,
        contextFile: CONTEXT_FILE
    });
});

app.post('/update-settings', async (req, res) => {
    const { phoneNumber, contextFile } = req.body;
    
    if (!phoneNumber || !contextFile) {
        return res.status(400).json({ status: 'error', error: 'Phone number and context file are required' });
    }

    try {
        // Validate context file exists
        await fs.access(path.join(process.cwd(), contextFile));
        
        // Update settings
        CONTACT_PHONE_NUMBER = phoneNumber;
        CONTEXT_FILE = contextFile;
        
        res.json({ status: 'success', message: 'Settings updated successfully' });
    } catch (error) {
        res.status(400).json({ status: 'error', error: 'Invalid context file path' });
    }
});

// Update context file endpoint
app.post('/update-context', express.json(), async (req, res) => {
    try {
        const { context, filename = 'default.txt' } = req.body;
        if (!context) {
            return res.status(400).json({ error: 'Context is required' });
        }

        const contextPath = path.join(process.cwd(), 'contexts', filename);
        await fs.writeFile(contextPath, context);
        res.json({ status: 'success', message: 'Context updated successfully' });
    } catch (error) {
        console.error('Error updating context:', error);
        res.status(500).json({ error: 'Failed to update context' });
    }
});

// Health check endpoint
app.get('/test-env', (req, res) => {
    const hasApiKey = !!process.env.OPENAI_API_KEY;
    res.json({
        status: 'success',
        environment: {
            hasOpenAIKey: hasApiKey,
            port: process.env.PORT || 3000
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    // Dynamically import 'open' to launch browser (ESM compatibility)
    import('open').then(open => {
        open.default(`http://localhost:${PORT}`);
    }).catch(err => {
        console.error('Failed to open browser:', err);
    });
});
