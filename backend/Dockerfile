# Use an appropriate Node.js base image
FROM node:20-alpine

# Set a working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend application code
COPY . .

# Build the TypeScript application
RUN npm run build

# Expose the backend port (default NestJS port is 3000)
EXPOSE 3000

# Set the default command to start the application in production mode
CMD ["node", "dist/main"]