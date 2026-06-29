# Dockerfile for the fragments microservice
# This image packages the app, its runtime dependencies, and the htpasswd file
# needed by the basic-auth test configuration.

# Match the local Node.js version as closely as possible.
FROM node:25.9.0 AS builder

LABEL maintainer="Abbi <abigaeljulao@gmail.com>"
LABEL description="Fragments node.js microservice"

# Build stage: install all dependencies
WORKDIR /app
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false
COPY package*.json ./
RUN npm ci

# Copy source (including test/htpasswd for basic-auth option)
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# Runtime stage: smaller image with only production assets
FROM node:25.9.0-slim AS runtime
WORKDIR /app

# Default runtime configuration for the container.
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Copy production node_modules and source from the builder stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/tests/.htpasswd ./tests/.htpasswd

# The service listens on port 8080.
EXPOSE 8080

# Start the server.
CMD ["npm","start"]
