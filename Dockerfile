# Build stage
FROM node:20-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies including dev dependencies
RUN npm ci

# Copy source code and configuration files
COPY tsconfig.json ./
COPY src/ ./src/

# Build the application
RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Remove husky prepare script and install production dependencies
RUN npm pkg delete scripts.prepare && \
    npm ci --omit=dev

# Copy built files from builder stage
COPY --from=builder /app/dist ./dist

ENV NODE_ENV=production

# Start the application
CMD ["node", "dist/index.js"] 
