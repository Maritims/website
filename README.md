# website
My personal website.

## microservice

This package contains microservices for various bits of functionality found on my personal website.

### Required environment variables

- PORT: The port which the microservice server should listen on.
- CORS_ORIGIN: The origin of the client(s) allowed to call the microservice server.

## website

This package contains the actual website. The website itself is contained within the `build/` directory. This package does not contain any functionality for serving the files.

## proxy

This package is used to serve the static files of the `website` package and also acts as a proxy for for requests from the website to the microservice server.

### Run and develop locally

To run the website locally, use the top-level `package.json` scripts.

- `npm run dev:all`: Runs the `microservice`, `website` and `proxy` dev scripts concurrently as defined in their respective `package.json` files.
` `npm run install:all`: Installs dependencies for the `microservice`, `website` and `proxy` packages.