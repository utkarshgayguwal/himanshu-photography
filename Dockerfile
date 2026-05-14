# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

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
