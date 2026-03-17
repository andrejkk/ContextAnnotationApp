# --- Stage 1: Build with Vite ---
FROM node:20-alpine AS build

WORKDIR /app

# Arguments provided by Portainer at build-time
ARG VITE_SUPABASE_URL
ARG VITE_SUPABASE_PUBLISHABLE_KEY

# Pass them into the environment for the Vite build
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Stage 2: Serve with Nginx ---
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]
# ===========================================================
# version: "3.9"

# services:
#   context-annotation-app:
#     build:
#       context: .
#       dockerfile: Dockerfile
#     container_name: context-annotation-app
#     ports:
#       - "3000:3000"
#     env_file:
#       - .env
#     restart: unless-stopped
