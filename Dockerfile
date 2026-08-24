# syntax=docker/dockerfile:1

# martevi frontend — React + TypeScript + Vite + MUI.
# Build with `context: ./frontend` (see ../docker-compose.yml).
#
# Three stages:
#   dev        - vite dev server with HMR, meant to run against a
#                bind-mounted source tree (see docker-compose.yml).
#   build      - `npm run build` (tsc -b && vite build) -> static/dist
#   production - nginx serving the static build, SPA fallback via nginx.conf
#
# Usage:
#   docker build --target dev        -t martevi-frontend:dev .
#   docker build --target production -t martevi-frontend:prod .

FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS dev
COPY . .
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

FROM base AS build
COPY . .
RUN npm run build

FROM nginx:1.27-alpine AS production
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
