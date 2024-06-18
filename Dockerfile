FROM nginx:alpine

COPY index.html /usr/share/nginx/html
COPY gameRules.json /usr/share/nginx/html
COPY app.js /usr/share/nginx/html
COPY style.css /usr/share/nginx/html
COPY resources /usr/share/nginx/html/resources

EXPOSE 80