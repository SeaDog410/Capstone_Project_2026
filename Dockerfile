FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy application source
COPY . .

EXPOSE 3000

# Mount /app/nest.db as a volume to persist the SQLite database
VOLUME ["/app/nest.db"]

CMD ["node", "server.js"]
