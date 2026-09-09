<?php

namespace App\Mail;

use App\Http\Controllers\ApplicationFollowUpController;
use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Avis envoyé au candidat quand son dossier attend quelque chose de lui.
 *
 * Deux statuts seulement le déclenchent — « à compléter » et « acceptée » —
 * parce que ce sont les deux seuls où le dossier n'avance plus sans une action
 * du candidat. Le courrier porte donc l'essentiel : ce qui est attendu, et le
 * lien qui y mène directement, sans ressaisir de numéro.
 */
class ApplicationStatusUpdated extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Application $application) {}

    public function envelope(): Envelope
    {
        $subject = $this->application->awaitsCompletion()
            ? 'Demande n° ' . $this->application->reference . ' — dossier à compléter'
            : 'Demande n° ' . $this->application->reference . ' — dossier validé';

        return new Envelope(
            to: [$this->application->email],
            subject: $subject . ' — ASJA',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-updated',
            with: [
                'application' => $this->application,

                /* Le lien est signé et daté : il ouvre ce dossier-là, et rien
                   d'autre. Le candidat qui l'a laissé expirer retrouve son
                   dossier par la recherche, numéro et adresse e-mail en main. */
                'followUpUrl' => ApplicationFollowUpController::followUpUrl($this->application),
            ],
        );
    }
}
