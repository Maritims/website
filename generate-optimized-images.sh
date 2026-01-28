#!/bin/bash

# Usage: generate_optimized_images "website/src/images"
generate_optimized_images() {
    local target_dir="${1:-website/src/images}"

    # 1. Requirement Check
    if ! command -v magick &> /dev/null; then
        echo "Error: ImageMagick (magick) is required for image optimization." >&2
        return 1
    fi

    if [[ ! -d "$target_dir" ]]; then
        echo "Skip: Directory $target_dir not found." >&2
        return 0
    fi

    echo "Optimizing images in $target_dir..." >&2

    # 2. Find and process files
    # Excludes .webp and .svg files from the search entirely
    while IFS= read -r -d '' file_path; do
        _optimize_single_file "$file_path"
    done < <(find "$target_dir" -type f ! -name "*.webp" ! -name "*.svg" -print0)
}

# Internal helper function (prefixed with _ to indicate private use)
_optimize_single_file() {
    local source_path="$1"
    local dir
    dir=$(dirname "$source_path")
    local filename
    filename=$(basename "$source_path")

    local base_name="${filename%.*}"
    local target_path="$dir/$base_name.webp"

    # 1. Check if optimization is needed (mtime check: newer than)
    if [[ -f "$target_path" && "$target_path" -nt "$source_path" ]]; then
        echo "Skipping $filename: Up to date."
        return 0
    fi

    # 2. Optimize using ImageMagick
    echo "Converting: $filename -> $base_name.webp"
    if magick "$source_path" -quality 80 "$target_path"; then
        # 3. Success: Remove original (Careful: this matches your original JS logic)
        rm "$source_path"
        return 0
    else
        echo "FAILED: Could not process $source_path" >&2
        return 1
    fi
}