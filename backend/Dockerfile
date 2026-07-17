FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN mkdir -p src/uploads/customers src/uploads/cnic src/uploads/logos
EXPOSE 3000
CMD ["node", "server.js"]
