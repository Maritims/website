#!/bin/bash

# Generates a robots.txt for the website.
# Usage: generate_robots "https://example.com" "website/src/robots.txt"
generate_robots() {
    # 1. Capture arguments with sensible defaults
    local site_url="${1:-https://clueless.no}"
    local output_file="${2:-website/src/robots.txt}"

    # Log progress to stderr
    echo "Generating robots.txt for $site_url..." >&2

    # 2. Ensure the target directory exists
    local target_dir
    target_dir=$(dirname "$output_file")
    if [[ ! -d "$target_dir" ]]; then
        mkdir -p "$target_dir"
    fi

    # 3. Clean the URL (remove trailing slash)
    local clean_url="${site_url%/}"
    local sitemap_url="${clean_url}/sitemap.xml"

    # 4. Write the file
    # We use a heredoc to write directly to the output path
    cat <<EOF > "$output_file"
User-agent: *
Allow: /

Sitemap: ${sitemap_url}
EOF

    if [[ $? -eq 0 ]]; then
        echo "robots.txt saved to $output_file" >&2
        return 0
    else
        echo "Error: Failed to write robots.txt" >&2
        return 1
    fi
}