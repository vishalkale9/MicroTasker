# Use a lightweight Node.js version
FROM node:20-alpine

# Create app directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy all the rest of your code
COPY . .

# Expose the port the app runs on
EXPOSE 3001

# Start the server
CMD ["node", "index.js"]
