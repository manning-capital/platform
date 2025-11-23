# Stage 1: Build the Angular application
FROM node:20-alpine AS build

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application for production
RUN npm run build

# Stage 2: Serve with Node.js
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install serve package globally
RUN npm install -g serve

# Copy built application from build stage
COPY --from=build /app/dist/platform/browser ./dist

# Expose port 8080
EXPOSE 8080

# Start server
CMD ["serve", "-s", "dist", "-l", "8080"]

