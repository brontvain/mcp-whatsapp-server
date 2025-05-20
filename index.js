require('dotenv').config();
const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const OpenAI = require('openai');
const fs = require('fs').promises;
const path = require('path');

const CONTACT_PHONE_NUMBER = '17542015227'; // Replace with the contact's phone number (country code + number, no + or spaces)
const CONTEXT_FILE = 'contexts/default.txt';

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

const app = express();
const PORT = process.env.PORT || 3000;

// WhatsApp client setup
const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp client is ready!');
});

client.on('message', async msg => {
    // Get the sender's number (in the format 1234567890@c.us)
    const sender = msg.from;
    if (sender.endsWith('@c.us')) {
        const senderNumber = sender.replace('@c.us', '');
        if (senderNumber === CONTACT_PHONE_NUMBER) {
            try {
                // Load context from file
                const context = await loadContext();
                
                // Generate response using OpenAI
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

// Optional: Express server for health check
app.get('/', (req, res) => {
    res.send('MCP WhatsApp Server is running.');
});

// Test endpoint to verify environment variables
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

// Endpoint to update context file
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

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
