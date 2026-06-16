FROM node:22-alpine AS frontend-build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:1.27-alpine

ENV PORT=80
ENV BACKEND_UPSTREAM=backend:8081
ENV NGINX_ENVSUBST_FILTER=BACKEND_UPSTREAM|PORT

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY --from=frontend-build /app/dist/ /usr/share/nginx/html/

EXPOSE 80
