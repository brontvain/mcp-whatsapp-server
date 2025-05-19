const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const CONTACT_PHONE_NUMBER = '14254572311'; // Replace with the contact's phone number (country code + number, no + or spaces)
const AUTO_REPLY_MESSAGE = 'Hello! This is an automated response from MCP server.';

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
            // Send auto-reply
            await msg.reply(AUTO_REPLY_MESSAGE);
            console.log(`Auto-replied to ${senderNumber}`);
        }
    }
});

// Start WhatsApp client
client.initialize();

// Optional: Express server for health check
app.get('/', (req, res) => {
    res.send('MCP WhatsApp Server is running.');
});

app.listen(PORT, () => {
    console.log(`Express server listening on port ${PORT}`);
});
