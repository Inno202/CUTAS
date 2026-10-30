# syntax=docker/dockerfile:1
# CUTAS web front end: the React app built with Vite and served by nginx as a non-root user.
# nginx also forwards /api/ to the Django API, so the browser talks to a single origin.
#   docker build -t cutas-web .
# API on a different domain instead?  docker build --build-arg VITE_API_BASE_URL=https://api.example.ac.za/api/v1 \
#   -t cutas-web .   and run the container with API_ORIGIN=https://api.example.ac.za

FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
RUN npm run build

FROM nginxinc/nginx-unprivileged:1.28-alpine
USER root
RUN rm -rf /usr/share/nginx/html/* /etc/nginx/conf.d/default.conf
COPY deploy/nginx/templates/ /etc/nginx/templates/
COPY --from=build /app/dist/ /usr/share/nginx/html/
USER 101
# Values substituted into the nginx templates when the container starts.
ENV API_UPSTREAM=http://api:8000 \
    API_ORIGIN= \
    API_RATE_LIMIT=50r/s \
    API_RATE_BURST=200 \
    TRUSTED_PROXY_CIDR=172.16.0.0/12 \
    NGINX_ENTRYPOINT_LOCAL_RESOLVERS=1
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:8080/healthz || exit 1
