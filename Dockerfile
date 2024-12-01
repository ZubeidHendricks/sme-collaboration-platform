# Base node image
FROM node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Build frontend
RUN cd frontend && npm install && npm run build

# Expose port
EXPOSE 3000

# Start command
CMD ["npm", "run", "start"]