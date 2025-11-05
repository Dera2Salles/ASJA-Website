# Stage 1: Build the application
FROM node:20-alpine AS build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# Stage 2: Serve the application
FROM nginx:stable-alpine

RUN apk add --no-cache jq

# Copy built assets from the build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy the entrypoint script and Nginx config
COPY entrypoint.sh /entrypoint.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Make the entrypoint script executable
RUN chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

# The default command for the entrypoint script is to start nginx
CMD ["nginx", "-g", "daemon off;"]
