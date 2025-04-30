FROM nginx:stable-alpine
COPY --chown=nginx:nginx website/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]