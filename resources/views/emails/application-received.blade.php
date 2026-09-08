{{--
    Accusé de réception d'une demande d'inscription ou de réinscription.

    Écrit en HTML de table et en styles inline : les clients de messagerie
    ignorent les feuilles de style externes et la plupart des règles modernes.
    Aucune image n'est chargée depuis le serveur — un accusé doit rester
    lisible même quand le client bloque les images distantes.
--}}
@php
    $documents = $application->documents->pluck('label')->all();

    /* Le récapitulatif ne montre que ce que le candidat a déclaré : une
       réinscription ne donne ni état civil, ni niveau, ni mention — ces lignes
       disparaissent au lieu de rester vides. */
    $recap = array_filter([
        'Candidat' => $application->full_name,
        'Numéro matricule' => $application->student_number,
        'Type de demande' => $application->type_label,
        'Niveau demandé' => $application->level,
        'Mention' => $application->mention_name,
        'Adresse e-mail' => $application->email,
        'Statut' => $application->status_label,
    ], fn ($value) => filled($value));

    $fees = App\Models\Application::feesFor($application->type);
    $account = App\Models\Application::BANK_ACCOUNT;

    /* Ce qui est déjà versé — le bordereau joint en fait preuve — et ce qui
       ne le sera qu'une fois le dossier validé. */
    $dueAfter = App\Models\Application::feeDue(
        $application->type,
        App\Models\Application::FEE_AFTER_VALIDATION,
    );
@endphp
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Demande {{ $application->reference }}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:Helvetica,Arial,sans-serif;color:#18181b;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:24px 12px;">
    <tr>
        <td align="center">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background-color:#ffffff;border:1px solid #e4e4e7;">

                {{-- Bandeau --}}
                <tr>
                    <td style="background-color:#111111;padding:28px 32px;">
                        <p style="margin:0;color:#35cf7f;font-size:11px;font-weight:bold;letter-spacing:1.6px;text-transform:uppercase;">
                            ASJA — Service de la scolarité
                        </p>
                        <h1 style="margin:10px 0 0;color:#ffffff;font-size:24px;line-height:1.2;font-weight:bold;">
                            Votre demande a bien été reçue
                        </h1>
                    </td>
                </tr>

                <tr>
                    <td style="padding:32px;">
                        <p style="margin:0 0 16px;font-size:15px;line-height:1.6;">
                            Bonjour{{ $application->full_name ? ' ' . $application->full_name : '' }},
                        </p>

                        <p style="margin:0 0 20px;font-size:15px;line-height:1.6;">
                            Nous confirmons la réception de votre demande de
                            <strong>{{ strtolower($application->type_label) }}</strong>.
                            Votre dossier est enregistré et pris en compte par l'établissement.
                        </p>

                        {{-- Numéro de demande : l'information à retenir --}}
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                               style="border:1px solid #e4e4e7;background-color:#fafafa;margin:0 0 24px;">
                            <tr>
                                <td style="padding:18px 20px;text-align:center;">
                                    <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#71717a;">
                                        Numéro de demande
                                    </p>
                                    <p style="margin:6px 0 0;font-size:24px;font-weight:bold;letter-spacing:1px;color:#111111;">
                                        {{ $application->reference }}
                                    </p>
                                </td>
                            </tr>
                        </table>

                        {{-- Récapitulatif --}}
                        <h2 style="margin:0 0 12px;font-size:13px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#71717a;">
                            Récapitulatif
                        </h2>

                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;font-size:14px;">
                            @foreach ($recap as $label => $value)
                                <tr>
                                    <td style="padding:9px 0;border-bottom:1px solid #f4f4f5;color:#71717a;width:45%;">{{ $label }}</td>
                                    <td style="padding:9px 0;border-bottom:1px solid #f4f4f5;font-weight:bold;">{{ $value }}</td>
                                </tr>
                            @endforeach
                        </table>

                        @if ($documents)
                            <h2 style="margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#71717a;">
                                Pièces reçues
                            </h2>
                            <ul style="margin:0 0 24px;padding-left:20px;font-size:14px;line-height:1.8;">
                                @foreach ($documents as $document)
                                    <li>{{ $document }}</li>
                                @endforeach
                            </ul>
                        @endif

                        @if ($fees)
                            <h2 style="margin:0 0 10px;font-size:13px;font-weight:bold;letter-spacing:1.2px;text-transform:uppercase;color:#71717a;">
                                Frais
                            </h2>

                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;font-size:14px;">
                                @foreach ($fees as $fee)
                                    <tr>
                                        <td style="padding:9px 0;border-bottom:1px solid #f4f4f5;width:60%;">
                                            {{ $fee['label'] }}<br>
                                            <span style="font-size:12.5px;color:#71717a;">{{ $fee['moment'] }}</span>
                                        </td>
                                        <td style="padding:9px 0;border-bottom:1px solid #f4f4f5;font-weight:bold;text-align:right;vertical-align:top;">
                                            {{ $fee['formatted'] }}
                                        </td>
                                    </tr>
                                @endforeach
                            </table>

                            {{-- Le compte : la seule information dont le candidat
                                 a besoin pour verser. --}}
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                                   style="border:1px solid #e4e4e7;background-color:#fafafa;margin:0 0 24px;">
                                <tr>
                                    <td style="padding:14px 20px;">
                                        <p style="margin:0;font-size:11px;font-weight:bold;letter-spacing:1.4px;text-transform:uppercase;color:#71717a;">
                                            Compte de versement
                                        </p>
                                        <p style="margin:5px 0 0;font-size:16px;font-weight:bold;color:#111111;">
                                            {{ $account['bank'] }} {{ $account['holder'] }} — {{ $account['number'] }}
                                        </p>
                                        @if ($dueAfter)
                                            <p style="margin:8px 0 0;font-size:13px;line-height:1.6;color:#52525b;">
                                                Les <strong>{{ $dueAfter }}</strong> de frais généraux ne sont à verser
                                                qu'une fois votre dossier validé&nbsp;: n'anticipez pas ce versement.
                                            </p>
                                        @endif
                                    </td>
                                </tr>
                            </table>
                        @endif

                        {{-- La finalisation : le point que le candidat doit lire --}}
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
                               style="border-left:3px solid #35cf7f;background-color:#f6fdf9;margin:0 0 24px;">
                            <tr>
                                <td style="padding:18px 20px;">
                                    <p style="margin:0 0 10px;font-size:15px;font-weight:bold;">
                                        Votre inscription n'est pas encore définitive
                                    </p>
                                    <p style="margin:0 0 12px;font-size:14px;line-height:1.6;">
                                        Le dépôt en ligne ne finalise pas l'inscription. Vous devez vous rendre au
                                        <strong>bureau de la scolarité</strong> pour finaliser votre dossier, en apportant :
                                    </p>
                                    <ul style="margin:0;padding-left:20px;font-size:14px;line-height:1.8;">
                                        <li>les <strong>documents originaux</strong> correspondant aux pièces téléversées ;</li>
                                        <li><strong>deux photos d'identité identiques, format 4×4, en buste</strong> ;</li>
                                        <li>le présent numéro de demande : <strong>{{ $application->reference }}</strong>.</li>
                                    </ul>
                                </td>
                            </tr>
                        </table>

                        <p style="margin:0 0 8px;font-size:14px;line-height:1.6;color:#52525b;">
                            Le service de la scolarité est ouvert de 8h à 12h et de 13h30 à 15h, à Antsaha.
                        </p>
                        <p style="margin:0;font-size:14px;line-height:1.6;color:#52525b;">
                            Conservez ce message : il vaut accusé de réception.
                        </p>
                    </td>
                </tr>

                <tr>
                    <td style="background-color:#fafafa;border-top:1px solid #e4e4e7;padding:18px 32px;">
                        <p style="margin:0;font-size:12px;line-height:1.6;color:#a1a1aa;">
                            Message automatique — merci de ne pas y répondre.
                            Pour toute question, contactez le bureau de la scolarité de l'ASJA.
                        </p>
                    </td>
                </tr>

            </table>
        </td>
    </tr>
</table>
</body>
</html>
