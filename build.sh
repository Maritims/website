#!/bin/bash

# Ensure the script stops if a command fails
set -e

# Load modules
# Use absolute-style paths relative to the script location for reliability
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)
source "$SCRIPT_DIR/generate-optimized-images.sh"
source "$SCRIPT_DIR/generate-robots.sh"
source "$SCRIPT_DIR/generate-sitemap.sh"

# Configuration
# Default to clueless.no but allow override via environment variable
SITE_URL="${SITE_URL:-https://clueless.no}"
SRC_DIR="website/src"
IMAGES_DIR="$SRC_DIR/images"

# Pre-flight Requirement Check
if ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (magick) is required for image optimization." >&2
    exit 1
fi

if ! command -v bc &> /dev/null; then
    echo "Error: 'bc' is required for timing calculations. Install with 'apt install bc' or 'brew install bc'." >&2
    exit 1
fi

build() {
    # Start timer (milliseconds)
    local start_time=$(date +%s%3N)

    echo "------------------------------------------"
    echo "Starting build for: $SITE_URL"
    echo "------------------------------------------"

    echo "--- [1/3] Optimizing Images ---"
    # Call function from generate-optimized-images.sh
    generate_optimized_images "$IMAGES_DIR"

    echo "--- [2/3] Generating Sitemap ---"
    # Call function from generate-sitemap.sh
    generate_sitemap "$SRC_DIR" "$SITE_URL" "$SRC_DIR/sitemap.xml"

    echo "--- [3/3] Generating Robots ---"
    # Call function from generate-robots.sh
    generate_robots "$SITE_URL" "$SRC_DIR/robots.txt"

    # End timer and calculate elapsed time
    local end_time=$(date +%s%3N)
    local elapsed=$(echo "scale=3; ($end_time - $start_time) / 1000" | bc)

    echo "------------------------------------------"
    echo "Build complete in ${elapsed}s"
    echo "------------------------------------------"
}

# Execute the build
build