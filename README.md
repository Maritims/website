# clueless-website
My personal website.

## website

This package contains the actual website. The website itself is contained within the `build/` directory. This package does not contain any functionality for serving the files.

### Run and develop locally

To run the website locally, use the top-level `package.json` scripts.

- `npm run dev`: Runs the `website` dev script as defined in its `package.json` file.
- `npm run install`: Installs dependencies for the `website` package.

### Deploy

To deploy the website, use the top-level `package.json` script:

- `npm run deploy`: Builds the website container image, creates an OCI artifact and uploads it to the server via SFTP.