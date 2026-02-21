
# --- Stage 1: Builder ---
# Use a recent Node.js image with Alpine Linux for a small base image
FROM node:20-alpine AS builder

# Set the working directory for the builder stage
WORKDIR /app

# Copy package.json and package-lock.json (or yarn.lock) and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the TypeScript application (transpile to JavaScript). 
# This assumes you have a 'build' script in your package.json (e.g., "build": "tsc")
RUN npm run build

# --- Stage 2: Production Runtime ---
# Use a minimal Node.js runtime image for the final application
FROM node:20-alpine AS production

# Set the working directory for the runtime stage
WORKDIR /app

# Copy only necessary files from the builder stage
# Copy package.json and package-lock.json to install only production dependencies
COPY --from=builder /app/package*.json ./
RUN npm install --only=production

# Copy the transpiled JavaScript files from the 'bin' (or 'build') directory
# Update 'bin' to match your tsconfig.json output directory
COPY --from=builder /app/bin ./bin
ENV NODE_ENV=production

# Set the command to run the built JavaScript file

CMD ["node", "./bin/src/index.js"] 
# COPY --from=builder /app/bin ./bin
# COPY --from=builder /app/node_modules ./node_modules
# COPY --from=builder /app/auth.json ./auth.json
# COPY --from=builder /app/curses.json ./curses.json



# CMD ["node", "src/index.js"]