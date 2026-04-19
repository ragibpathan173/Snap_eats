FROM nginx:1.27-alpine

ENV PORT=80
ENV BACKEND_UPSTREAM=backend:8081
ENV NGINX_ENVSUBST_FILTER=BACKEND_UPSTREAM|PORT

COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY index.html /usr/share/nginx/html/index.html
COPY snap_eats.html /usr/share/nginx/html/snap_eats.html
COPY company.html /usr/share/nginx/html/company.html
COPY contact.html /usr/share/nginx/html/contact.html
COPY legal.html /usr/share/nginx/html/legal.html
COPY snap_eats.css /usr/share/nginx/html/snap_eats.css
COPY footer_pages.css /usr/share/nginx/html/footer_pages.css
COPY snap_eats.js /usr/share/nginx/html/snap_eats.js
COPY config.js /usr/share/nginx/html/config.js
COPY images /usr/share/nginx/html/images

EXPOSE 80
