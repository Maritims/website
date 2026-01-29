#!/bin/bash

# 1. Verify Caddy is installed
if ! command -v caddy &> /dev/null; then
    echo "Error: Caddy is not installed."
    exit 1
fi

# Configuration
PROXY_PORT=5000
FRONTEND_URL="localhost:3000"
BACKEND_URL="localhost:8080"

# 2. Start the Python Frontend in the background
echo "Starting Python Frontend on $FRONTEND_URL..."
python3 -X utf8 -m http.server 3000 --directory website/src &
PYTHON_PID=$!

# 3. Start Caddy
echo "Starting Caddy reverse proxy on http://localhost:$PROXY_PORT..."

# We use 'trap' to kill the Python server when you press Ctrl+C to stop the script
trap "kill $PYTHON_PID; echo 'Shutting down...'; exit" SIGINT SIGTERM

caddy run --adapter caddyfile --config - <<EOF
:$PROXY_PORT {
    # Match /api/guestbook and anything following it
    # handle_path strips the matched part (/api/guestbook) automatically
    handle_path /api/guestbook* {
        reverse_proxy $BACKEND_URL
    }

    handle {
        reverse_proxy $FRONTEND_URL
    }

    log {
        output stdout
    }
}
EOF