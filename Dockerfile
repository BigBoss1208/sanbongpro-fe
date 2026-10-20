# ===== Stage 1: Build the React app =====
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies (cached when lockfile unchanged)
COPY package*.json ./
RUN npm ci

# Build the production bundle
COPY . .
# API base URL is baked in at build time; override via build-arg in CI
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

# ===== Stage 2: Serve static files with nginx =====
FROM nginx:1.25-alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
ENV API_UPSTREAM=http://sports-be:8084
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
