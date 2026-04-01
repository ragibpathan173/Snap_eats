FROM nginx:1.27-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/index.html
COPY snap_eats.html /usr/share/nginx/html/snap_eats.html
COPY snap_eats.css /usr/share/nginx/html/snap_eats.css
COPY snap_eats.js /usr/share/nginx/html/snap_eats.js
COPY config.js /usr/share/nginx/html/config.js
COPY images /usr/share/nginx/html/images

EXPOSE 80
