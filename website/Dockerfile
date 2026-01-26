FROM docker.io/nginx:stable-alpine

# Copy static content.
COPY ./src /usr/share/nginx/html

# Copy custom nginx config.
COPY ./config/default.conf /etc/nginx/conf.d/default.conf

# Expose port 80.
EXPOSE 80

# Run nginx in the foreground.
CMD ["nginx", "-g", "daemon off;"]