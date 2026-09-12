{{--
    Métadonnées de la page, écrites dans le document.

    Inertia rend les pages côté navigateur : une balise posée par React
    n'existe qu'après l'exécution du JavaScript. Les robots de partage
    (Facebook, WhatsApp, X) n'en exécutent pas — ils ne liraient donc rien.
    D'où ces balises ici, alimentées par la prop `seo` de la page
    (App\Support\Seo), disponible dans `$page['props']`.

    L'attribut `inertia` les confie au gestionnaire d'en-tête d'Inertia :
    au montage, il remplace chacune par celle que rend le composant <Seo>
    côté React, puis les tient à jour d'une navigation à l'autre. Sans cet
    attribut elles resteraient figées après la première page. Les deux côtés
    lisent la même prop et doivent donc rendre la même liste de balises.
--}}
@php
    $seo = $page['props']['seo'] ?? [];
    $preload = $page['props']['preloadImage'] ?? null;
@endphp

<title inertia>{{ $seo['title'] ?? config('seo.site_name') }}</title>

@isset($seo['description'])
    <meta inertia="description" name="description" content="{{ $seo['description'] }}">
@endisset

@isset($seo['canonical'])
    <link inertia="canonical" rel="canonical" href="{{ $seo['canonical'] }}">
@endisset

@isset($seo['robots'])
    <meta inertia="robots" name="robots" content="{{ $seo['robots'] }}">
@endisset

<meta inertia="og:type" property="og:type" content="{{ $seo['type'] ?? 'website' }}">
<meta inertia="og:site_name" property="og:site_name" content="{{ $seo['siteName'] ?? config('seo.site_name') }}">
<meta inertia="og:locale" property="og:locale" content="{{ $seo['locale'] ?? config('seo.og_locale') }}">
<meta inertia="og:title" property="og:title" content="{{ $seo['title'] ?? config('seo.site_name') }}">

@isset($seo['description'])
    <meta inertia="og:description" property="og:description" content="{{ $seo['description'] }}">
@endisset

@isset($seo['canonical'])
    <meta inertia="og:url" property="og:url" content="{{ $seo['canonical'] }}">
@endisset

@isset($seo['image'])
    <meta inertia="og:image" property="og:image" content="{{ $seo['image'] }}">
    @isset($seo['imageWidth'])
        <meta inertia="og:image:width" property="og:image:width" content="{{ $seo['imageWidth'] }}">
    @endisset
    @isset($seo['imageHeight'])
        <meta inertia="og:image:height" property="og:image:height" content="{{ $seo['imageHeight'] }}">
    @endisset
@endisset

{{-- Carte de partage X : `summary_large_image` n'est honoré qu'avec une image. --}}
<meta inertia="twitter:card" name="twitter:card" content="{{ isset($seo['image']) ? 'summary_large_image' : 'summary' }}">
<meta inertia="twitter:title" name="twitter:title" content="{{ $seo['title'] ?? config('seo.site_name') }}">

@isset($seo['description'])
    <meta inertia="twitter:description" name="twitter:description" content="{{ $seo['description'] }}">
@endisset

@isset($seo['image'])
    <meta inertia="twitter:image" name="twitter:image" content="{{ $seo['image'] }}">
@endisset

@if (! empty($seo['twitterSite']))
    <meta inertia="twitter:site" name="twitter:site" content="{{ $seo['twitterSite'] }}">
@endif

@if (! empty($seo['schema']))
    {{-- Données structurées. Le graphe ne décrit que ce qui est réellement
         affiché sur la page : établissement, article, événement, fil d'Ariane. --}}
    <script inertia="schema" type="application/ld+json">@json($seo['schema'], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)</script>
@endif

@if ($preload)
    {{-- Image de bannière : le seul téléchargement qui doive partir avant le
         JavaScript. Voir App\Support\Images. --}}
    <link rel="preload" as="image" fetchpriority="high"
          href="{{ $preload['href'] }}"
          @if (! empty($preload['srcset']))
              imagesrcset="{{ $preload['srcset'] }}"
              imagesizes="{{ $preload['sizes'] }}"
          @endif
    >
@endif
