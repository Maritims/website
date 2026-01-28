#!/bin/bash

set -euo pipefail

# --- Configuration ---
DEPLOY_USER="${DEPLOY_USER:-}"
DEPLOY_HOST="${DEPLOY_HOST:-}"
DEST_DIR=".local/share/podman/incoming-images"

declare -A IMAGES=(
    ["clueless-website:latest"]="./website"
    ["clueless-guestbook:latest"]="./guestbook"
)

# --- Validation ---
if [[ -z "$DEPLOY_USER" || -z "$DEPLOY_HOST" ]]; then
    echo "Error: DEPLOY_USER and DEPLOY_HOST must be set."
    exit 1
fi

CREATED_FILES=()

cleanup() {
    echo "> Cleaning up local artifacts..."
    for f in "${CREATED_FILES[@]}"; do
        rm -f "$f"
    done
}
trap cleanup EXIT

# --- 1. Build and Save Stage ---
for IMG_NAME in "${!IMAGES[@]}"; do
    CONTEXT="${IMAGES[$IMG_NAME]}"
    TAR_NAME="${IMG_NAME//:/_}.tar"

    echo "> Building $IMG_NAME..."
    podman build -t "$IMG_NAME" "$CONTEXT"

    echo "> Saving to $TAR_NAME..."
    podman save --format oci-archive -o "$TAR_NAME" "$IMG_NAME"

    CREATED_FILES+=("$TAR_NAME")
done

# --- 2. Single Session Upload Stage ---
echo "> Ensuring remote directory exists..."
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "mkdir -p $DEST_DIR"

echo "> Uploading all files to $DEPLOY_HOST (as .part)..."
{
    for f in "${CREATED_FILES[@]}"; do
        # Upload as .part so the systemd watcher ignores it during transfer
        echo "put $f $DEST_DIR/$f.part"
    done
    echo "quit"
} | sftp -b - "${DEPLOY_USER}@${DEPLOY_HOST}"

# --- 3. Atomic Rename Stage ---
echo "> Atomically moving files to trigger watchers..."
RENAME_COMMANDS=""
for f in "${CREATED_FILES[@]}"; do
    RENAME_COMMANDS+="mv $DEST_DIR/$f.part $DEST_DIR/$f; "
done

# This triggers the .path unit only AFTER the file is fully moved/present
ssh "${DEPLOY_USER}@${DEPLOY_HOST}" "$RENAME_COMMANDS"

echo "Deployment complete!"