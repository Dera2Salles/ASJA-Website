<?php

namespace App\Support;

use App\Models\Application;
use App\Models\ApplicationDocument;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * Écriture des pièces justificatives sur le disque privé.
 *
 * Volontairement distinct de `App\Support\Uploads`, qui sert les images du
 * site : en production la racine du dépôt *est* la racine web, et tout ce qui
 * atterrit sous `uploads/` est servi directement par Apache. Une photocopie de
 * CIN n'a rien à y faire. Ces fichiers vont donc sur le disque `local`
 * (`storage/app/private`), et n'en sortent que par la route d'administration,
 * derrière l'authentification.
 *
 * Le dépôt initial et le parcours de complétion écrivent tous deux par ici :
 * une seconde implémentation aurait tôt fait d'oublier l'une des trois
 * précautions ci-dessous.
 */
class ApplicationFiles
{
    /**
     * Attache une pièce à une demande, en remplaçant celle de même nature.
     *
     * Trois précautions, chacune pour une raison :
     *
     * - le nom fourni par le client n'est jamais réutilisé sur le disque — un
     *   identifiant engendré ferme d'un coup la traversée de chemin, la
     *   collision de noms et le fichier à double extension ;
     * - le nom d'origine est conservé en base, pour l'affichage seul, tronqué
     *   parce qu'il vient tout de même du client ;
     * - la pièce précédente est supprimée, fichier compris : la table impose
     *   une seule pièce par nature, et remplacer n'est pas empiler. Sans cela
     *   un candidat qui redépose son bulletin laisserait l'ancien fichier sur
     *   le disque sans plus aucune ligne pour le désigner.
     */
    public static function attach(
        Application $application,
        string $type,
        UploadedFile $file
    ): ApplicationDocument {
        $application->document($type)?->delete();

        $extension = strtolower($file->extension() ?: $file->getClientOriginalExtension());

        $path = Storage::disk(Application::DISK)->putFileAs(
            'applications/' . $application->reference,
            $file,
            $type . '-' . Str::uuid() . ($extension ? '.' . $extension : '')
        );

        $document = $application->documents()->create([
            'type' => $type,
            'path' => $path,
            'original_name' => Str::limit(basename($file->getClientOriginalName()), 180, ''),
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size' => $file->getSize() ?: 0,
        ]);

        /* La relation est déjà chargée par l'appelant : sans cette remise à
           zéro, `document()` continuerait de rendre la pièce supprimée. */
        $application->unsetRelation('documents');

        return $document;
    }

    /**
     * Attache plusieurs pièces d'un coup, en ignorant ce qui n'est pas un
     * fichier ou pas une nature connue : la validation a déjà tranché, ceci
     * n'est qu'un dernier filet avant l'écriture sur le disque.
     *
     * @param  array<string, mixed>  $files
     * @return array<int, string> natures effectivement écrites
     */
    public static function attachMany(Application $application, array $files): array
    {
        $written = [];

        foreach ($files as $type => $file) {
            if (! isset(Application::DOCUMENTS[$type]) || ! $file instanceof UploadedFile) {
                continue;
            }

            static::attach($application, $type, $file);
            $written[] = $type;
        }

        return $written;
    }
}
