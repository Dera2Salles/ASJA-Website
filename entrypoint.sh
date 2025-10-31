#!/bin/sh
set -e

echo "🚀 Initializing React application..."

# Variables avec valeurs par défaut
export VITE_BACKEND_URL=${VITE_BACKEND_URL:-"http://localhost:3000"}
export VITE_STRAPI_URL=${VITE_STRAPI_URL:-"http://localhost:1337"}
export VITE_BOT_URL=${VITE_BOT_URL:-"http://localhost:3001"}
export VITE_APP_ENV=${VITE_APP_ENV:-"development"}

# Créer un fichier de configuration JavaScript dynamique
cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL}",
  VITE_STRAPI_URL: "${VITE_STRAPI_URL}",
  VITE_BOT_URL: "${VITE_BOT_URL}",
  VITE_APP_ENV: "${VITE_APP_ENV}"
};
EOF

# Injecter aussi dans un fichier JSON pour un accès facile
cat > /usr/share/nginx/html/env.json << EOF
{
  "VITE_BACKEND_URL": "${VITE_BACKEND_URL}",
  "VITE_STRAPI_URL": "${VITE_STRAPI_URL}",
  "VITE_BOT_URL": "${VITE_BOT_URL}",
  "VITE_APP_ENV": "${VITE_APP_ENV}"
}
EOF

# Log de configuration
echo "📋 React App Configuration:"
echo "   Backend URL: $VITE_BACKEND_URL"
echo "   Strapi URL: $VITE_STRAPI_URL"
echo "   Bot URL: $VITE_BOT_URL"
echo "   Environment: $VITE_APP_ENV"

echo "✅ Configuration completed. Starting nginx..."
exec "$@"
