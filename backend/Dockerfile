# Use official Node.js 22 Alpine image
FROM node:22-alpine

# Set working directory inside container
WORKDIR /app

# Copy dependency manifests first for optimal Docker layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy application source code with non-root ownership
COPY --chown=node:node . .

# Ensure uploads directory exists and is owned by non-root node user
RUN mkdir -p /app/uploads && chown -R node:node /app

# Run as non-root user
USER node

# Expose backend server port
EXPOSE 5000

# Start Express server
CMD ["npm", "start"]
