#!/bin/bash

set -e

echo "=== Déploiement ASJA Pre-Prod ==="

if [ ! -f "ASJA-DATA.json" ]; then
    echo "Erreur: Le fichier ASJA-DATA.json n'existe pas dans le répertoire courant"
    exit 1
fi

echo "Encodage du fichier ASJA-DATA.json en base64..."

if [ -z "$ASJA_DATA_BASE64" ]; then
    echo "Erreur: L'encodage base64 a échoué"
    exit 1
fi

echo "Variable ASJA_DATA_BASE64 exportée avec succès"

echo "Création du réseau Docker..."
docker network create asja-network 2>/dev/null || true

echo "Démarrage des services..."

echo "Lancement de Strapi..."
docker run -d \
    --name strapi-pre-prod \
    --network asja-network \
    -p 1337:1337 \
    mandaharou/strapi-docker:v1.0

echo "Attente du démarrage de Strapi..."
sleep 10

echo "Lancement de ASJA-WEBSITE..."
docker run -d \
    --name asja-pre-prod \
    --network asja-network \
    -p 8080:80 \
    -e VITE_GEMINI_API_KEY="" \
    -e VITE_STRAPI_URL="http://localh:1337" \
    -e ASJA_DATA_BASE64="$(base64 -w 0 ASJA-DATA.json)" \
    dera2salles/asja-website:0.0.6

echo "=== Déploiement terminé avec succès ==="
