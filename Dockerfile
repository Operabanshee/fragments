# Dockerfile for the fragments microservice
# This image packages the app, its runtime dependencies, and the htpasswd file
# needed by the basic-auth test configuration.

# Match the local Node.js version as closely as possible.
FROM node:25.9.0

LABEL maintainer="Abbi <abigaeljulao@gmail.com>"
LABEL description="Fragments node.js microservice"

# Default runtime configuration for the container.
ENV PORT=8080
ENV NPM_CONFIG_LOGLEVEL=warn
ENV NPM_CONFIG_COLOR=false

# Keep all application files relative to /app.
WORKDIR /app

# Copy dependency manifests first so Docker can cache npm install layers.
COPY package*.json ./

# Install dependencies declared by package-lock.json.
RUN npm install

# Copy the service source and the basic-auth htpasswd file.
COPY ./src ./src
COPY ./tests/.htpasswd ./tests/.htpasswd

# The service listens on port 8080.
EXPOSE 8080

# Start the server.
CMD npm start
