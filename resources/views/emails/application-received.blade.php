{{--
    Accusé de réception d'une demande d'inscription ou de réinscription.

    L'enveloppe — bandeau, carte, pied, couleurs — vient de la mise en page
    commune ; ce fichier ne dit que ce qui est propre à l'accusé.
--}}
@extends('emails.layouts.asja')

@php
    use App\Models\Application;
    use App\Support\MailTheme as Theme;

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

    $fees = Application::feesFor($application->type);
    $account = Application::BANK_ACCOUNT;

    /* Ce qui est déjà versé — le bordereau joint en fait preuve — et ce qui
       ne le sera qu'une fois le dossier validé. */
    $dueAfter = Application::feeDue($application->type, Application::FEE_AFTER_VALIDATION);
@endphp

@section('title', 'Demande ' . $application->reference)
@section('heading', 'Votre demande a bien été reçue')

@section('content')
    <p style="{{ Theme::text('0 0 16px') }}">
        Bonjour{{ $application->full_name ? ' ' . $application->full_name : '' }},
    </p>

    <p style="{{ Theme::text() }}">
        Nous confirmons la réception de votre demande de
        <strong>{{ strtolower($application->type_label) }}</strong>.
        Votre dossier est enregistré et pris en compte par l'établissement.
    </p>

    {{-- Numéro de demande : l'information à retenir --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel() }}">
        <tr>
            <td style="padding:18px 20px;text-align:center;">
                <p style="{{ Theme::eyebrow() }}">Numéro de demande</p>
                <p style="{{ Theme::figure() }}">{{ $application->reference }}</p>
            </td>
        </tr>
    </table>

    {{-- Récapitulatif --}}
    <h2 style="{{ Theme::heading() }}">Récapitulatif</h2>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        @foreach ($recap as $label => $value)
            <tr>
                <td style="{{ Theme::cell('color:' . Theme::INK_SOFT . ';width:45%;') }}">{{ $label }}</td>
                <td style="{{ Theme::cell('font-weight:bold;') }}">{{ $value }}</td>
            </tr>
        @endforeach
    </table>

    @if ($documents)
        <h2 style="{{ Theme::heading() }}">Pièces reçues</h2>
        <ul style="{{ Theme::list() }}">
            @foreach ($documents as $document)
                <li>{{ $document }}</li>
            @endforeach
        </ul>
    @endif

    @if ($fees)
        <h2 style="{{ Theme::heading() }}">Frais</h2>

        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 16px;">
            @foreach ($fees as $fee)
                <tr>
                    <td style="{{ Theme::cell('width:60%;') }}">
                        {{ $fee['label'] }}<br>
                        <span style="font-size:12.5px;color:{{ Theme::INK_SOFT }};">{{ $fee['moment'] }}</span>
                    </td>
                    <td style="{{ Theme::cell('font-weight:bold;text-align:right;vertical-align:top;') }}">
                        {{ $fee['formatted'] }}
                    </td>
                </tr>
            @endforeach
        </table>

        {{-- Le compte : la seule information dont le candidat a besoin pour verser. --}}
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel() }}">
            <tr>
                <td style="padding:14px 20px;">
                    <p style="{{ Theme::eyebrow() }}">Compte de versement</p>
                    <p style="margin:5px 0 0;font-size:16px;font-weight:bold;color:{{ Theme::INK }};">
                        {{ $account['bank'] }} {{ $account['holder'] }} — {{ $account['number'] }}
                    </p>
                    @if ($dueAfter)
                        <p style="{{ Theme::muted('8px 0 0') }}">
                            Les <strong>{{ $dueAfter }}</strong> de frais généraux ne sont à verser
                            qu'une fois votre dossier validé&nbsp;: n'anticipez pas ce versement.
                        </p>
                    @endif
                </td>
            </tr>
        </table>
    @endif

    {{-- La finalisation : le point que le candidat doit lire --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel(true) }}">
        <tr>
            <td style="padding:18px 20px;">
                <p style="margin:0 0 10px;font-size:15px;font-weight:bold;color:{{ Theme::INK }};">
                    Votre inscription n'est pas encore définitive
                </p>
                <p style="{{ Theme::text('0 0 12px') }}">
                    Le dépôt en ligne ne finalise pas l'inscription. Vous devez vous rendre au
                    <strong>bureau de la scolarité</strong> pour finaliser votre dossier, en apportant :
                </p>
                <ul style="{{ Theme::list('0') }}">
                    <li>les <strong>documents originaux</strong> correspondant aux pièces téléversées ;</li>
                    <li><strong>deux photos d'identité identiques, format 4×4, en buste</strong> ;</li>
                    <li>le présent numéro de demande : <strong>{{ $application->reference }}</strong>.</li>
                </ul>
            </td>
        </tr>
    </table>

    {{-- Suivi du dossier : où revenir, et pourquoi on y revient --}}
    <h2 style="{{ Theme::heading() }}">Suivre votre dossier</h2>

    <p style="{{ Theme::text('0 0 16px') }}">
        L'état de votre demande est consultable en ligne. C'est aussi par là que vous
        déposerez les pièces manquantes si le service de la scolarité vous en réclame
        @if ($dueAfter)
            , ainsi que le bordereau des frais généraux le moment venu
        @endif
        . Vous n'aurez jamais à refaire votre candidature.
    </p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
            <td style="background-color:{{ Theme::BRAND }};">
                <a href="{{ $followUpUrl }}" style="{{ Theme::button() }}">Suivre ma demande</a>
            </td>
        </tr>
    </table>

    <p style="{{ Theme::muted('0 0 8px') }}">
        Le service de la scolarité est ouvert de 8h à 12h et de 13h30 à 15h, à Antsaha.
    </p>
    <p style="{{ Theme::muted() }}">
        Conservez ce message : il vaut accusé de réception.
    </p>
@endsection

@section('footer')
    Message automatique — merci de ne pas y répondre.
    Pour toute question, contactez le bureau de la scolarité de l'ASJA.
@endsection
