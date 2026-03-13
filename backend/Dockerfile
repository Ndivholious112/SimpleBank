# Backend Docker image for SimpleBank
# Uses Node 22 LTS

FROM node:22-alpine

WORKDIR /app

# Install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --production

# Copy backend source
COPY backend ./backend

WORKDIR /app/backend

# Start the server
CMD ["npm", "start"]
