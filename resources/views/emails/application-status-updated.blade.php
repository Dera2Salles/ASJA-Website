{{--
    Avis de changement de statut : dossier à compléter, ou dossier validé.

    Même enveloppe que l'accusé de réception, par héritage plutôt que par
    ressemblance : les deux courriers ne peuvent plus diverger.
--}}
@extends('emails.layouts.asja')

@php
    use App\Models\Application;
    use App\Support\MailTheme as Theme;

    $incomplete = $application->awaitsCompletion();

    /* Ce qui est réclamé, écrit en clair : le candidat doit savoir quoi
       préparer avant même d'ouvrir la page. */
    $documents = array_map(
        fn (string $type) => Application::DOCUMENTS[$type]['label'],
        $application->requestedDocumentTypes(),
    );

    $fields = array_map(
        fn (array $field) => $field['label'],
        Application::fieldSpecsFor($application->requestedFieldNames()),
    );

    $feesType = $application->feesDocumentType();
    $feesAmount = Application::feeDue($application->type, Application::FEE_AFTER_VALIDATION);
    $account = Application::BANK_ACCOUNT;
@endphp

@section('title', 'Demande ' . $application->reference)
@section('heading', $incomplete ? 'Votre dossier doit être complété' : 'Votre dossier a été validé')

@section('content')
    <p style="{{ Theme::text('0 0 16px') }}">
        Bonjour{{ $application->full_name ? ' ' . $application->full_name : '' }},
    </p>

    {{-- Numéro de demande : l'information à retenir --}}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel(false, '0 0 22px') }}">
        <tr>
            <td style="padding:14px 18px;">
                <p style="{{ Theme::eyebrow() }}">Numéro de demande</p>
                <p style="{{ Theme::figure() }}">{{ $application->reference }}</p>
            </td>
        </tr>
    </table>

    @if ($incomplete)
        <p style="{{ Theme::text() }}">
            Après examen, votre dossier ne peut pas être instruit en l'état.
            <strong>Vous n'avez pas à le refaire</strong> : seuls les éléments ci-dessous
            vous sont demandés.
        </p>

        @if ($application->completion_message)
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel(true, '0 0 22px') }}">
                <tr>
                    <td style="padding:14px 18px;">
                        <p style="{{ Theme::text('0') }}">{!! nl2br(e($application->completion_message)) !!}</p>
                    </td>
                </tr>
            </table>
        @endif

        @if ($documents)
            <h2 style="{{ Theme::heading() }}">Pièces à fournir de nouveau</h2>
            <ul style="{{ Theme::list('0 0 20px') }}">
                @foreach ($documents as $label)
                    <li>{{ $label }}</li>
                @endforeach
            </ul>
        @endif

        @if ($fields)
            <h2 style="{{ Theme::heading() }}">Informations à corriger</h2>
            <ul style="{{ Theme::list('0 0 20px') }}">
                @foreach ($fields as $label)
                    <li>{{ $label }}</li>
                @endforeach
            </ul>
        @endif
    @else
        <p style="{{ Theme::text() }}">
            Votre demande de <strong>{{ strtolower($application->type_label) }}</strong>
            a été retenue par l'établissement.
        </p>

        @if ($feesType && $feesAmount)
            <p style="{{ Theme::text('0 0 16px') }}">
                Il vous reste à verser les <strong>frais généraux</strong>,
                d'un montant de <strong>{{ $feesAmount }}</strong>, puis à nous
                transmettre votre bordereau de versement en ligne.
            </p>

            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="{{ Theme::panel(false, '0 0 22px') }}">
                <tr>
                    <td style="padding:14px 18px;">
                        <p style="{{ Theme::eyebrow() }}">Compte de versement</p>
                        <p style="margin:5px 0 0;font-size:16px;font-weight:bold;color:{{ Theme::INK }};">
                            {{ $account['bank'] }} {{ $account['holder'] }} — {{ $account['number'] }}
                        </p>
                    </td>
                </tr>
            </table>
        @else
            <p style="{{ Theme::text() }}">
                Vous pouvez suivre l'avancement de votre dossier en ligne, et vous
                présenter au bureau de la scolarité pour la finalisation.
            </p>
        @endif
    @endif

    {{-- Le lien mène droit au dossier : aucun numéro à ressaisir. --}}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 22px;">
        <tr>
            <td style="background-color:{{ Theme::BRAND }};">
                <a href="{{ $followUpUrl }}" style="{{ Theme::button() }}">
                    {{ $incomplete ? 'Compléter mon dossier' : 'Ouvrir mon dossier' }}
                </a>
            </td>
        </tr>
    </table>

    <p style="{{ Theme::muted() }}">
        Ce lien est personnel et expire au bout de 30 jours. Passé ce délai,
        retrouvez votre dossier depuis la page « Compléter mon dossier » du site,
        avec votre numéro de demande et cette adresse e-mail.
    </p>
@endsection
