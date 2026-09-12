<!DOCTYPE html>
{{-- Le site est rédigé en français : `APP_LOCALE` pilote les traductions
     du serveur, pas la langue des pages publiques. --}}
<html lang="{{ config('seo.lang', 'fr') }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        @include('partials.icons')
        @include('partials.seo')

        {{-- Polices : `preconnect` ouvre la connexion au serveur de polices
             avant même que le CSS ne la réclame, `display=swap` laisse le texte
             s'afficher dans une police de secours plutôt que de rester
             invisible le temps du téléchargement. --}}
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link rel="preconnect" href="https://fonts.bunny.net" crossorigin>
        <link href="https://fonts.bunny.net/css?family=archivo:500,600,700,800,900|inter:400,500,600,700,800|jetbrains-mono:400,500&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
    </head>
    <body>
        @inertia
    </body>
</html>
