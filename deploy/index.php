<?php

/*
 * Point d'entrée de production.
 *
 * En production la racine web est la racine du dépôt (tout est déployé dans
 * `public_html`) : ce fichier remplace `public/index.php`, dont les chemins
 * remontent d'un cran de trop. Installé par `deploy.sh` sous le nom `index.php`
 * à la racine du site.
 */

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Mode maintenance (`php artisan down`)...
if (file_exists($maintenance = __DIR__ . '/storage/framework/maintenance.php')) {
    require $maintenance;
}

// Autoloader Composer...
require __DIR__ . '/vendor/autoload.php';

// Démarrage de Laravel et traitement de la requête...
/** @var Application $app */
$app = require_once __DIR__ . '/bootstrap/app.php';

$app->handleRequest(Request::capture());
