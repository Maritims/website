#!/bin/bash

# Exit on error
set -e

# Configuration from environment or defaults
if [ -z "$DEPLOY_USER" ]; then
    echo "Error: DEPLOY_USER environment variable is not set"
    exit 1
fi

if [ -z "$DEPLOY_HOST" ]; then
    echo "Error: DEPLOY_HOST environment variable is not set"
    exit 1
fi


IMAGE_NAME="clueless-website"
TAG="latest"
TAR_NAME="clueless-website.tar"
DESTINATION="${DEPLOY_USER}@${DEPLOY_HOST}:.local/share/podman/incoming-images"

echo "Building the website..."
npm run build --prefix website

echo "Building the Podman image..."
podman build -t $IMAGE_NAME:$TAG ./website

echo "Saving image to OCI tarball..."
podman save --format oci-archive -o $TAR_NAME $IMAGE_NAME:$TAG

echo "Uploading via SFTP..."
# Using sftp in batch mode
# We create a temporary file for sftp commands
SFTP_BATCH=$(mktemp)
echo "put $TAR_NAME" > "$SFTP_BATCH"
sftp -b "$SFTP_BATCH" $DESTINATION
rm "$SFTP_BATCH"

echo "Cleaning up local tarball..."
rm $TAR_NAME

echo "Deployment complete!"
