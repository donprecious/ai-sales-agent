# Use an appropriate Node.js base image
FROM node:20-alpine

# Set a working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend application code
COPY . .

# Expose the Vite development server port
EXPOSE 5173

# Set the default command to start the Vite development server
CMD ["npm", "run", "dev", "--", "--host"]