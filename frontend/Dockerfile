# Stage 1: Build React/Vite application
FROM node:22-alpine AS builder

WORKDIR /app

# Copy dependency manifests first for optimal layer caching
COPY package.json package-lock.json ./

# Install exact dependencies
RUN npm ci

# Accept build arguments for Vite environment variables
ARG VITE_API_URL
ARG VITE_GA_MEASUREMENT_ID

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID

# Copy application source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Serve production bundle with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration with SPA routing & reverse proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts from builder stage to Nginx public HTML directory
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port
EXPOSE 80

# Run Nginx in foreground
CMD ["nginx", "-g", "daemon off;"]
