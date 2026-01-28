# clueless-website
My personal website.

## Dependencies

- JDK 21
- Maven 3.9.9
- Podman 5.4.2
- OpenSSH
- ImageMagick 7

## Modules

- website: the site itself.
- guestbook: a microservice powering the website's guestbook.

## Run and develop locally

To run the website locally for development, run `./dev.sh` to start a web server listening on port 3000 serving the static content from `website/src`.

## Deploy to production

Run `./deploy.sh` to build and deploy the container images for the website and guestbook modules.