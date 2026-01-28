#!/bin/bash

generate_sitemap() {
    # Accept arguments or use defaults
    local source_dir="${1:-website/src}"
    local site_url="${2:-https://clueless.no}"
    local output_file="${3:-$source_dir/sitemap.xml}"

    # Validate directory
    if [ ! -d "$source_dir" ]; then
        echo "Error: Directory $source_dir does not exist." >&2
        return 1
    fi

    echo "Generating sitemap for $site_url..." >&2

    # Start sitemap XML and redirect to file
    {
        echo '<?xml version="1.0" encoding="UTF-8"?>'
        echo '<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">'

        # Find all .html files
        # Using -print0 to handle filenames with spaces safely
        find "$source_dir" -type f -name "*.html" -print0 | while IFS= read -r -d '' file_path; do

            # 1. Build relative path
            local rel_path=${file_path#"$source_dir"}

            # 2. Clean path: replace backslashes (for Windows compat), remove index.html
            local clean_path=${rel_path//\\//}
            clean_path=${clean_path/index.html/}

            # 3. Ensure leading slash
            [[ "$clean_path" != /* ]] && clean_path="/$clean_path"

            # 4. Get last modified date (ISO 8601)
            local last_mod=$(date -u -r "$file_path" +"%Y-%m-%dT%H:%M:%SZ")

            # 5. Build full URL
            local base_url=${site_url%/}
            local full_url="${base_url}${clean_path}"

            echo "  <url>"
            echo "    <loc>${full_url}</loc>"
            echo "    <lastmod>${last_mod}</lastmod>"
            echo "  </url>"
        done

        echo "</urlset>"
    } > "$output_file"

    echo "Sitemap saved to $output_file"
    return 0
}