# Stage 1: Build the application
# We use a Node.js base image to install dependencies and build the project
FROM node:20-alpine AS build

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's cache
# This means if dependencies haven't changed, Docker will skip npm install
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the project for production
# This generates the 'dist' folder with optimized static files
RUN npm run build

# Stage 2: Serve the application using Nginx
# We use a lightweight Nginx image to serve the static content
FROM nginx:stable-alpine

# Copy the build output from the previous stage to Nginx's public directory
COPY --from=build /app/dist /usr/share/nginx/html

# Copy a custom Nginx configuration to handle SPA routing (Single Page Application)
# This ensures that routes like /about or /portfolio work correctly when refreshed
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80 to the outside world
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
