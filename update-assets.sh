#!/bin/bash
BUILD_DIR="public/build/assets"
BLADE_FILE="resources/views/app.prod.blade.php"
BUILD_SRC="public/build"
BUILD_DEST="build"

# Déplace le dossier build vers la racine
if [ -d "$BUILD_SRC" ]; then
  rm -rf $BUILD_DEST
  cp -R $BUILD_SRC $BUILD_DEST
  echo "✅ Dossier build déplacé vers la racine"
fi

# Trouve le vrai nom du CSS et JS
CSS_FILE=$(ls $BUILD_DIR/*.css 2>/dev/null | head -n 1 | xargs basename)
JS_FILE=$(ls $BUILD_DIR/app-*.js 2>/dev/null | head -n 1 | xargs basename)

if [ -z "$CSS_FILE" ] || [ -z "$JS_FILE" ]; then
  echo "⚠️  Aucun fichier build trouvé, skipping..."
  exit 0
fi

# Met à jour app.blade.php avec le bon chemin
sed -i "s|build/assets/app-.*\.css|build/assets/$CSS_FILE|g" $BLADE_FILE
sed -i "s|build/assets/app-.*\.js|build/assets/$JS_FILE|g" $BLADE_FILE

# Ajoute les fichiers modifiés au commit
git add $BLADE_FILE
git add $BUILD_DEST

echo "✅ app.blade.php mis à jour : $JS_FILE / $CSS_FILE"
