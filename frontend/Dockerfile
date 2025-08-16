# Stage 1: Build the React application
FROM node:18-alpine as builder

RUN corepack enable && corepack prepare yarn@4.9.2 --activate


WORKDIR /app

COPY package.json yarn.lock ./
COPY .yarn .yarn
# COPY .yarnrc.yml ./

RUN yarn install --immutable

COPY . .

RUN yarn build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

# Create a dummy nginx.conf for local development
# Save this as nginx.conf in your frontend directory
# events {
#   worker_connections 1024;
# }

# http {
#   server {
#     listen 80;
#     location / {
#       root /usr/share/nginx/html;
#       index index.html;
#       try_files $uri $uri/ /index.html;
#     }
#   }
# }