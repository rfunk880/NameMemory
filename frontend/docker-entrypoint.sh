#!/bin/sh
set -e

# Runtime environment variable injection for SPA
# This replaces placeholder values in the built JS with actual runtime values

# If VITE_API_URL is set at runtime, inject it into the built files
if [ -n "$RUNTIME_API_URL" ]; then
    echo "Injecting runtime API URL: $RUNTIME_API_URL"
    # Find and replace the API URL in JavaScript files
    find /usr/share/nginx/html/assets -name '*.js' -exec sed -i "s|RUNTIME_API_URL_PLACEHOLDER|$RUNTIME_API_URL|g" {} \;
fi

# Execute the main command
exec "$@"
