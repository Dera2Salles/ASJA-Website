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
DEFAULT_ASJA_DATA="ASJA_DATA : L'Athénée Saint Joseph Antsirabe (ASJA) est une université catholique située à Antsirabe et Antsohihy, Madagascar. Elle a pour mission l'excellence académique, la discipline, la foi et l'engagement social. Les diplômes sont reconnus par le MESupReS de Madagascar et suivent le système LMD. L'université dispose de cafétérias et propose des activités sportives. Pour s'inscrire, on peut aller au service de scolarité ou s'inscrire en ligne, en fournissant les documents nécessaires (copie légalisée des bulletins de notes, acte de naissance, photos, lettre de motivation, etc.). Les frais de scolarité sont de 250 000 Ariary, mais peuvent varier selon le niveau d’études. Les créateurs du site sont Dera, Manda, et Santatra. L'université propose 6 mentions : SCIENCES AGRONOMIQUES (parcours : Production Animale, Production Végétale, Agroalimentaire), DROIT (parcours : Droit des Affaires, Droit Processuel), ECONOMIE ET COMMERCE (parcours : Economie et Développement, Gestion et commerces Internationaux), INFORMATIQUE (parcours : Génie Logiciel, Télécommunication, Génie Industriel), LANGUES ÉTRANGÈRES APPLIQUÉES, et SCIENCES DE LA TERRE (parcours : Hydrogéologie, Géologie Minière). Pour plus de détails sur les contacts: Tél: 034 49 483 19, Email: example@gmail.com, Adresse: Antsaha, Antsirabe, Madagascar, Facebook: https://www.facebook.com/UniversiteASJA."

# Determine ASJA_DATA content
if [ -n "$ASJA_DATA_JSON" ]; then
  echo "📦 Found ASJA_DATA_JSON environment variable, using it for ASJA_DATA."
  # Validate and compact the JSON from the environment variable
  ASJA_DATA_CONTENT=$(echo "$ASJA_DATA_JSON" | jq -c '.')
elif [ -f "$ASJA_DATA_FILE" ]; then
  echo "📄 Found asja-data.json, using it for ASJA_DATA."
  ASJA_DATA_CONTENT=$(jq -c . "$ASJA_DATA_FILE")
else
  echo "ℹ️ No custom data provided, using default ASJA_DATA."
  ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
fi

export VITE_ASJA_DATA="$ASJA_DATA_CONTENT"

# Create a dynamic JavaScript configuration file using jq for safety
JS_CONFIG_FILE="/usr/share/nginx/html/env-config.js"
JSON_CONFIG_FILE="/usr/share/nginx/html/env.json"

# Gather all VITE_ variables and build a JSON object
# This approach is robust and handles special characters and multiline values.
CONFIG_JSON=$(env | grep ^VITE_ | awk -F= '{
  name=$1
  value=substr($0, index($0,"=")+1)
  printf "%s\n%s\n", name, value
}' | jq -n 'reduce inputs as $i ({}; . + { ($i): (input) } )')

# Write the JS config file
echo "window._env_ = $(echo "$CONFIG_JSON" | jq .);" > "$JS_CONFIG_FILE"

# Write the JSON config file
echo "$CONFIG_JSON" | jq . > "$JSON_CONFIG_FILE"


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