{{--
    Enveloppe commune des courriers de l'ASJA.

    Les deux messages — accusé de réception, avis de changement de statut —
    partageaient une mise en page recopiée à l'identique : la moindre retouche
    n'en corrigeait qu'un, et le second dérivait en silence. Le bandeau, la
    carte, le pied et la palette vivent donc ici, et un nouveau courrier hérite
    de l'ensemble en remplissant deux sections.

    HTML de table et styles en attribut : les clients de messagerie ignorent les
    feuilles de style externes et la plupart des règles modernes. Aucune image
    n'est chargée depuis le serveur — un courrier doit rester lisible quand le
    client bloque les images distantes, ce que beaucoup font par défaut.

    Les couleurs ne sont jamais écrites ici : elles viennent de `MailTheme`, qui
    n'en connaît que deux.
--}}
@php use App\Support\MailTheme as Theme; @endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>@yield('title', 'ASJA')</title>
</head>
<body style="{{ Theme::body() }}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"
       style="background-color:{{ Theme::BRAND_PALE }};padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                   style="max-width:600px;background-color:{{ Theme::PAPER }};border:1px solid {{ Theme::BRAND_LINE }};">

                {{-- Bandeau : l'aplat vert de l'établissement, jamais du noir --}}
                <tr>
                    <td style="background-color:{{ Theme::BRAND }};padding:28px 32px;">
                        <p style="{{ Theme::eyebrow(true) }}">
                            ASJA — Service de la scolarité
                        </p>
                        <h1 style="margin:10px 0 0;color:{{ Theme::PAPER }};font-size:24px;line-height:1.25;font-weight:bold;">
                            @yield('heading')
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding:32px;">
                        @yield('content')
                    </td>
                </tr>

                <tr>
                    <td style="background-color:{{ Theme::BRAND_PALE }};border-top:1px solid {{ Theme::BRAND_LINE }};padding:20px 32px;">
                        <p style="{{ Theme::muted() }}">
                            @section('footer')
                                Pour toute question, contactez le bureau de la scolarité de l'ASJA.
                            @show
                        </p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
</body>
</html>
