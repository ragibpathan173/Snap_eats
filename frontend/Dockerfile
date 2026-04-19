FROM nginx:1.27-alpine

ENV PORT=80
ENV BACKEND_UPSTREAM=backend:8081
ENV NGINX_ENVSUBST_FILTER=BACKEND_UPSTREAM|PORT

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY *.html /usr/share/nginx/html/
COPY *.css /usr/share/nginx/html/
COPY snap_eats.js /usr/share/nginx/html/snap_eats.js
COPY config.js /usr/share/nginx/html/config.js
COPY images /usr/share/nginx/html/images

EXPOSE 80
