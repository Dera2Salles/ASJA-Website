<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * Accusé de réception envoyé au candidat dès le dépôt de sa demande.
 *
 * Il confirme la réception, rappelle le numéro de dossier, et dit clairement
 * ce que le dépôt en ligne ne fait pas : l'inscription n'est définitive
 * qu'après passage au bureau de la scolarité, pièces originales et photos
 * d'identité en main.
 */
class ApplicationReceived extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(public Application $application) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            to: [$this->application->email],
            subject: 'Demande n° ' . $this->application->reference . ' bien reçue — ASJA',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-received',
            with: ['application' => $this->application],
        );
    }
}
