# Use Node.js LTS version
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies for whatsapp-web.js
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    freetype-dev \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    python3 \
    make \
    g++

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Create necessary directories
RUN mkdir -p public contexts

# Copy application files
COPY . .

# Create default context file if it doesn't exist
RUN echo "You are a respectful whatsapp agent. You only respond only in Spanish, in brief responses." > contexts/default.txt

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]