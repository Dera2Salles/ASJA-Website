#!/bin/sh
set -e

echo "🚀 Initializing React application..."

# Variables with default values
export VITE_BACKEND_URL=${VITE_BACKEND_URL:-"http://localhost:3000"}
export VITE_STRAPI_URL=${VITE_STRAPI_URL:-"http://localhost:1337"}
export VITE_BOT_URL=${VITE_BOT_URL:-"http://localhost:3001"}
export VITE_APP_ENV=${VITE_APP_ENV:-"development"}
export VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY:-""}

ASJA_DATA_FILE="/usr/share/nginx/html/asja-data.json"
DEFAULT_ASJA_DATA='{"description": "L'\''Athénée Saint Joseph Antsirabe (ASJA) est une université catholique située à Antsirabe et Antsohihy, Madagascar. Elle a pour mission l'\''excellence académique, la discipline, la foi et l'\''engagement social."}'

# Determine ASJA_DATA content
if [ -n "$ASJA_DATA_BASE64" ]; then
  echo "📦 Found ASJA_DATA_BASE64 environment variable, using it for ASJA_DATA."

  # Decode base64 and validate JSON
  if ASJA_DATA_CONTENT=$(echo "$ASJA_DATA_BASE64" | base64 -d 2>/dev/null); then
    # Validate if the decoded content is valid JSON
    if echo "$ASJA_DATA_CONTENT" | jq . >/dev/null 2>&1; then
      echo "✅ Successfully decoded and validated JSON from ASJA_DATA_BASE64"
    else
      echo "❌ Decoded content is not valid JSON, using default data"
      ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
    fi
  else
    echo "❌ Failed to decode base64, using default data"
    ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
  fi
elif [ -f "$ASJA_DATA_FILE" ]; then
  echo "📄 Found asja-data.json, using it for ASJA_DATA."
  if ASJA_DATA_CONTENT=$(jq -c . "$ASJA_DATA_FILE" 2>/dev/null); then
    echo "✅ Successfully loaded JSON from file"
  else
    echo "❌ Invalid JSON in file, using default data"
    ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
  fi
else
  echo "ℹ️ No custom data provided, using default ASJA_DATA."
  ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
fi

export VITE_ASJA_DATA="$ASJA_DATA_CONTENT"

# Create a dynamic JavaScript configuration file
JS_CONFIG_FILE="/usr/share/nginx/html/env-config.js"
JSON_CONFIG_FILE="/usr/share/nginx/html/env.json"

# Gather all VITE_ variables and build a JSON object
CONFIG_JSON="{"
FIRST=true

for var in $(env | grep ^VITE_ | cut -d= -f1); do
  value=$(eval echo "\$$var")
  if [ "$FIRST" = "true" ]; then
    FIRST=false
  else
    CONFIG_JSON="$CONFIG_JSON,"
  fi
  # Escape special characters in the value
  escaped_value=$(echo "$value" | sed 's/"/\\"/g' | sed 's/\//\\\//g')
  CONFIG_JSON="$CONFIG_JSON \"$var\": \"$escaped_value\""
done

CONFIG_JSON="$CONFIG_JSON }"

# Write the JS config file
echo "window._env_ = $CONFIG_JSON;" > "$JS_CONFIG_FILE"

# Write the JSON config file using jq if available, otherwise basic echo
if command -v jq >/dev/null 2>&1; then
  echo "$CONFIG_JSON" | jq . > "$JSON_CONFIG_FILE" 2>/dev/null || echo "$CONFIG_JSON" > "$JSON_CONFIG_FILE"
else
  echo "$CONFIG_JSON" > "$JSON_CONFIG_FILE"
fi

# Log configuration
echo "📋 React App Configuration:"
echo "   Backend URL: $VITE_BACKEND_URL"
echo "   Strapi URL: $VITE_STRAPI_URL"
echo "   Bot URL: $VITE_BOT_URL"
echo "   Environment: $VITE_APP_ENV"

# Trim ASJA data for logging to avoid flooding logs
VITE_ASJA_DATA_TRIMMED=$(echo "$VITE_ASJA_DATA" | cut -c 1-70)
echo "   ASJA Data: $VITE_ASJA_DATA_TRIMMED..."

if [ -n "$VITE_GEMINI_API_KEY" ]; then
  echo "   Gemini API Key: [set]"
else
  echo "   Gemini API Key: [not set]"
fi

echo "✅ Configuration completed. Starting nginx..."
exec "$@"
