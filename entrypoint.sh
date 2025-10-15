#!/bin/sh

# Le répertoire où Vite place les fichiers construits
ASSETS_DIR=/usr/share/nginx/html

# Backend par défaut si la variable d'environnement n'est pas définie
DEFAULT_BACKEND_URL="http://localhost:3000"

# Utiliser la variable d'environnement BACKEND_URL si définie, sinon la valeur par défaut
TARGET_URL=${BACKEND_URL:-$DEFAULT_BACKEND_URL}

echo "Using BACKEND_URL: $TARGET_URL"

# Remplacer le placeholder dans tous les fichiers .js du répertoire et sous-répertoires
find "$ASSETS_DIR" -type f -name "*.js" | while read -r file; do
  echo "Processing $file..."
  # Utiliser un fichier temporaire pour sed afin de garantir la compatibilité
  sed "s|__BACKEND_URL__|$TARGET_URL|g" "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  echo "Replaced placeholder in $file with $TARGET_URL"
done

# Lancer la commande CMD du Dockerfile (par exemple nginx)
exec "$@"
