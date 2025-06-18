# Use Node 18
FROM node:18

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .

# Start the server
CMD ["node", "index.js"]

# Tell Cloud Run which port
EXPOSE 8080
