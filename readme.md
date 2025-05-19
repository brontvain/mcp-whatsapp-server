# MCP WhatsApp Server

This server automatically responds to WhatsApp messages from a specific contact.

## Features

- Listens for incoming WhatsApp messages.
- Automatically replies to a specified contact.
- Simple Express server for health checks.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Edit `index.js`:**
   - Set `CONTACT_PHONE_NUMBER` to your contact's phone number (country code + number, no `+` or spaces).

3. **Run the server:**
   ```bash
   npm start
   ```

4. **Scan the QR code** with your WhatsApp app to authenticate.

## Dependencies

- [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)
- [express](https://expressjs.com/)
- [qrcode-terminal](https://www.npmjs.com/package/qrcode-terminal)

---

**Note:**  
- The WhatsApp session is stored locally. If you want to reset authentication, delete the `.wwebjs_auth` folder.
- This is for educational purposes. Use responsibly and comply with WhatsApp's terms of service.
