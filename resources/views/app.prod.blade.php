{{--
    Vue racine de production.

    En production le serveur ne fait pas tourner Vite : les assets sont ceux du
    dernier `npm run build`, et cette vue les référence par leur nom de fichier
    définitif plutôt que par `@vite`. Elle se substitue à `app.blade.php` au
    déploiement (voir README), sur le même principe que `index-for-prod.php`
    chez ariel.

    `@viteReactRefresh` disparaît avec elle : c'est l'outillage de développement,
    il n'a rien à faire sur le serveur.

    Les noms de fichiers portent une empreinte qui change à chaque build.
    `php artisan build:prod-view` les remet à jour depuis
    `public/build/manifest.json` — à lancer après chaque `npm run build`.
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title inertia>{{ config('app.name', 'Laravel') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=archivo:500,600,700,800,900|inter:400,500,600,700,800|jetbrains-mono:400,500,600,700&display=swap" rel="stylesheet" />

        <!-- CSS du build -->
        <link rel="stylesheet" href="{{ asset('build/assets/app-QMPbJ3mM.css') }}">

        <!-- Scripts -->
        @routes

        <!-- JS du build : les pages sont chargées à la demande par Inertia. -->
        <script type="module" src="{{ asset('build/assets/app-Dux0Ici7.js') }}"></script>

        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
