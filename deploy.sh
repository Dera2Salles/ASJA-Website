#!/usr/bin/env bash
#
# Déploiement ASJA sur cPanel.
#
# Schéma retenu : la racine web est la racine du dépôt. Tout le contenu du
# dépôt est publié dans `public_html`, avec le point d'entrée `deploy/index.php`
# installé sous le nom `index.php` et le `.htaccess` de `deploy/` qui protège
# les dossiers applicatifs. Le contenu de `public/` est recopié à la racine,
# pour que `/build/assets/...`, `/asja-logo.png` et `/robots.txt` répondent.
#
# Ce qui vit sur le serveur et ne doit jamais être écrasé par le dépôt :
# `.env`, `uploads/` (les fichiers téléversés par l'administration) et
# `storage/` (journaux, caches, sessions).
#
# Usage :
#   ./deploy.sh                     déploiement complet
#   DOCROOT=~/public_html ./deploy.sh
#   DRY_RUN=1 ./deploy.sh           montre ce qui serait fait, n'écrit rien
#
set -euo pipefail

# ---------------------------------------------------------------------------
# Configuration — à ajuster une fois, ou à passer en variable d'environnement.
# ---------------------------------------------------------------------------
DOCROOT="${DOCROOT:-$HOME/public_html}"
REPO="${REPO:-$HOME/repositories/ASJA-Website}"
BACKUP_DIR="${BACKUP_DIR:-$HOME/backups/asja}"
KEEP_BACKUPS="${KEEP_BACKUPS:-5}"
PHP_BIN="${PHP_BIN:-php}"
COMPOSER_BIN="${COMPOSER_BIN:-composer}"
DRY_RUN="${DRY_RUN:-0}"

# ---------------------------------------------------------------------------

say()  { printf '\n\033[1m▸ %s\033[0m\n' "$*"; }
info() { printf '  %s\n' "$*"; }
die()  { printf '\n\033[31m✗ %s\033[0m\n' "$*" >&2; exit 1; }

run() {
    if [ "$DRY_RUN" = "1" ]; then
        printf '  [dry-run] %s\n' "$*"
    else
        "$@"
    fi
}

# ---------------------------------------------------------------------------
# 1. Vérifications — toutes AVANT la moindre écriture.
#
# Le script d'origine effaçait `public_html` puis découvrait les problèmes
# ensuite : un échec à mi-course laissait le site vide. Ici, rien n'est touché
# tant que tout n'est pas réuni.
# ---------------------------------------------------------------------------
say "Vérifications"

[ -d "$REPO" ]    || die "Dépôt introuvable : $REPO (variable REPO)"
[ -d "$DOCROOT" ] || die "Racine web introuvable : $DOCROOT (variable DOCROOT)"

case "$DOCROOT" in
    "$HOME" | "$HOME/" | "/" | "") die "DOCROOT refusé : $DOCROOT" ;;
esac
[ "$(readlink -f "$DOCROOT")" != "$(readlink -f "$REPO")" ] \
    || die "DOCROOT et REPO désignent le même dossier."

command -v rsync           >/dev/null || die "rsync est requis."
command -v "$PHP_BIN"      >/dev/null || die "php introuvable (variable PHP_BIN)."
command -v "$COMPOSER_BIN" >/dev/null || die "composer introuvable (variable COMPOSER_BIN)."

# Les assets sont construits en local et versionnés : cPanel n'a pas Node.
[ -f "$REPO/public/build/manifest.json" ] \
    || die "public/build/manifest.json absent du dépôt. Lancez \`npm run build\` en local et versionnez public/build."

for f in deploy/index.php deploy/htaccess resources/views/app.prod.blade.php; do
    [ -f "$REPO/$f" ] || die "$f manquant dans le dépôt."
done

# `.env` vit sur le serveur, jamais dans le dépôt.
[ -f "$DOCROOT/.env" ] \
    || die "$DOCROOT/.env est absent. Créez-le (APP_KEY, APP_ENV=production, APP_DEBUG=false, base de données) avant le premier déploiement."

info "dépôt        $REPO"
info "racine web   $DOCROOT"
info "sauvegardes  $BACKUP_DIR"
[ "$DRY_RUN" = "1" ] && info "MODE SIMULATION : aucune écriture."

# ---------------------------------------------------------------------------
# 2. Sauvegarde de ce qui n'est pas dans le dépôt.
#
# Conservée après coup, contrairement au script d'origine qui la supprimait à
# la fin — c'est-à-dire au moment précis où elle devient utile.
# ---------------------------------------------------------------------------
say "Sauvegarde"

STAMP="$(date +%Y%m%d-%H%M%S)"
SNAPSHOT="$BACKUP_DIR/$STAMP"

run mkdir -p "$SNAPSHOT"
run cp -a "$DOCROOT/.env" "$SNAPSHOT/.env"
info "sauvegardé   .env"

if [ -d "$DOCROOT/uploads" ]; then
    run cp -a "$DOCROOT/uploads" "$SNAPSHOT/uploads"
    info "sauvegardé   uploads/ ($(find "$DOCROOT/uploads" -type f | wc -l) fichiers)"
fi

# ---------------------------------------------------------------------------
# 3. Publication du dépôt.
#
# rsync plutôt qu'un `rm -rf` suivi d'une copie : les chemins exclus sont
# préservés à la destination au lieu d'être détruits puis restaurés.
# ---------------------------------------------------------------------------
say "Publication du dépôt"

run rsync -a --delete \
    --exclude='.git/' \
    --exclude='.github/' \
    --exclude='node_modules/' \
    --exclude='/ariel/' \
    --exclude='/deploy/' \
    --exclude='/tests/' \
    --exclude='/.env' \
    --exclude='/uploads/' \
    --exclude='/storage/logs/' \
    --exclude='/storage/framework/cache/' \
    --exclude='/storage/framework/sessions/' \
    --exclude='/storage/framework/views/' \
    --exclude='/public/storage' \
    "$REPO/" "$DOCROOT/"

# Le contenu de `public/` remonte à la racine : c'est elle que sert Apache.
#
# `storage` est écarté : c'est le lien symbolique du disque `public` de Laravel,
# qui viendrait ici écraser le vrai dossier `storage/` — journaux, sessions et
# caches compris. Le disque `public` n'est plus utilisé de toute façon, les
# téléversements passent par `uploads/`.
#
# `index.php` et `.htaccess` sont écartés aussi : ceux de `public/` supposent
# une racine web qui ne contient que les fichiers publics. Ils sont remplacés
# juste après par ceux de `deploy/`.
run rsync -a \
    --exclude='/storage' \
    --exclude='/index.php' \
    --exclude='/.htaccess' \
    "$DOCROOT/public/" "$DOCROOT/"

run cp "$REPO/deploy/index.php" "$DOCROOT/index.php"
run cp "$REPO/deploy/htaccess"  "$DOCROOT/.htaccess"
info "installés    index.php, .htaccess"

run mkdir -p "$DOCROOT/uploads"

# ---------------------------------------------------------------------------
# 4. Dépendances PHP.
# ---------------------------------------------------------------------------
say "Dépendances"

run "$COMPOSER_BIN" install --no-dev --optimize-autoloader --no-interaction \
    --working-dir="$DOCROOT"

# ---------------------------------------------------------------------------
# 5. Vue racine de production.
#
# `app.prod.blade.php` référence les assets par leur empreinte : on la
# resynchronise sur le manifeste publié avant de l'installer, sinon un build
# oublié laisse une page blanche.
# ---------------------------------------------------------------------------
say "Vue de production"

run "$PHP_BIN" "$DOCROOT/artisan" build:prod-view
run cp "$DOCROOT/resources/views/app.prod.blade.php" "$DOCROOT/resources/views/app.blade.php"
info "installée    resources/views/app.blade.php"

# ---------------------------------------------------------------------------
# 6. Base de données et reprise des fichiers.
# ---------------------------------------------------------------------------
say "Base de données"

run "$PHP_BIN" "$DOCROOT/artisan" migrate --force

# Sans effet une fois la reprise faite : les chemins déjà en `/uploads/...` ne
# sont plus reconnus comme hérités du disque `public`.
run "$PHP_BIN" "$DOCROOT/artisan" uploads:migrate

# ---------------------------------------------------------------------------
# 7. Caches et permissions.
# ---------------------------------------------------------------------------
say "Caches"

run "$PHP_BIN" "$DOCROOT/artisan" optimize:clear
run "$PHP_BIN" "$DOCROOT/artisan" config:cache
run "$PHP_BIN" "$DOCROOT/artisan" route:cache
run "$PHP_BIN" "$DOCROOT/artisan" view:cache

run chmod -R ug+rwX "$DOCROOT/storage" "$DOCROOT/bootstrap/cache" "$DOCROOT/uploads"

# ---------------------------------------------------------------------------
# 8. Rotation des sauvegardes.
# ---------------------------------------------------------------------------
if [ -d "$BACKUP_DIR" ] && [ "$DRY_RUN" != "1" ]; then
    ls -1d "$BACKUP_DIR"/*/ 2>/dev/null \
        | sort -r \
        | tail -n +$((KEEP_BACKUPS + 1)) \
        | xargs -r rm -rf
fi

say "Déploiement terminé"
info "sauvegarde   $SNAPSHOT"
info "à vérifier   https://<domaine>/ puis https://<domaine>/.env (doit renvoyer 403)"
