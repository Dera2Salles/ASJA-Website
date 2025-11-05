#!/bin/sh
set -e

echo "🚀 Initializing React application..."

# Variables avec valeurs par défaut
export VITE_BACKEND_URL=${VITE_BACKEND_URL:-"http://localhost:3000"}
export VITE_STRAPI_URL=${VITE_STRAPI_URL:-"http://localhost:1337"}
export VITE_BOT_URL=${VITE_BOT_URL:-"http://localhost:3001"}
export VITE_APP_ENV=${VITE_APP_ENV:-"development"}

ASJA_DATA_FILE="/usr/share/nginx/html/asja-data.json"
DEFAULT_ASJA_DATA="ASJA_DATA : L'Athénée Saint Joseph Antsirabe (ASJA) est une université catholique située à Antsirabe et Antsohihy, Madagascar. Elle a pour mission l'excellence académique, la discipline, la foi et l'engagement social. Les diplômes sont reconnus par le MESupReS de Madagascar et suivent le système LMD. L'université dispose de cafétérias et propose des activités sportives. Pour s'inscrire, on peut aller au service de scolarité ou s'inscrire en ligne, en fournissant les documents nécessaires (copie légalisée des bulletins de notes, acte de naissance, photos, lettre de motivation, etc.). Les frais de scolarité sont de 250 000 Ariary, mais peuvent varier selon le niveau d’études. Les créateurs du site sont Dera, Manda, et Santatra. L'université propose 6 mentions : SCIENCES AGRONOMIQUES (parcours : Production Animale, Production Végétale, Agroalimentaire), DROIT (parcours : Droit des Affaires, Droit Processuel), ECONOMIE ET COMMERCE (parcours : Economie et Développement, Gestion et commerces Internationaux), INFORMATIQUE (parcours : Génie Logiciel, Télécommunication, Génie Industriel), LANGUES ÉTRANGÈRES APPLIQUÉES, et SCIENCES DE LA TERRE (parcours : Hydrogéologie, Géologie Minière). Pour plus de détails sur les contacts: Tél: 034 49 483 19, Email: example@gmail.com, Adresse: Antsaha, Antsirabe, Madagascar, Facebook: https://www.facebook.com/UniversiteASJA."

if [ -f "$ASJA_DATA_FILE" ]; then
  echo "📄 Found asja-data.json, using it for ASJA_DATA."
  ASJA_DATA_CONTENT=$(jq -c . "$ASJA_DATA_FILE")
else
  echo "ℹ️ asja-data.json not found, using default ASJA_DATA."
  ASJA_DATA_CONTENT="$DEFAULT_ASJA_DATA"
fi

export VITE_ASJA_DATA=$(echo "$ASJA_DATA_CONTENT" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g')

# Créer un fichier de configuration JavaScript dynamique
cat > /usr/share/nginx/html/env-config.js << EOF
window._env_ = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL}",
  VITE_STRAPI_URL: "${VITE_STRAPI_URL}",
  VITE_BOT_URL: "${VITE_BOT_URL}",
  VITE_APP_ENV: "${VITE_APP_ENV}",
  VITE_ASJA_DATA: "${VITE_ASJA_DATA}"
};
EOF

# Injecter aussi dans un fichier JSON pour un accès facile
cat > /usr/share/nginx/html/env.json << EOF
{
  "VITE_BACKEND_URL": "${VITE_BACKEND_URL}",
  "VITE_STRAPI_URL": "${VITE_STRAPI_URL}",
  "VITE_BOT_URL": "${VITE_BOT_URL}",
  "VITE_APP_ENV": "${VITE_APP_ENV}",
  "VITE_ASJA_DATA": "${VITE_ASJA_DATA}"
}
EOF

# Log de configuration
echo "📋 React App Configuration:"
echo "   Backend URL: $VITE_BACKEND_URL"
echo "   Strapi URL: $VITE_STRAPI_URL"
echo "   Bot URL: $VITE_BOT_URL"
echo "   Environment: $VITE_APP_ENV"
echo "   ASJA Data: $VITE_ASJA_DATA"

echo "✅ Configuration completed. Starting nginx..."
exec "$@"
