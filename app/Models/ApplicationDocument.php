<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

/**
 * Une pièce justificative attachée à une demande.
 *
 * Le fichier vit sur le disque privé : rien ici ne produit d'URL publique. Il
 * ne sort que par la route d'administration, qui le lit et le renvoie en
 * flux — c'est le seul endroit où l'accès est contrôlé.
 */
class ApplicationDocument extends Model
{
    protected $fillable = [
        'application_id', 'type', 'path', 'original_name', 'mime_type', 'size',
    ];

    protected $casts = ['size' => 'integer'];

    protected $appends = ['label'];

    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    public function getLabelAttribute(): string
    {
        return Application::DOCUMENTS[$this->type]['label'] ?? $this->type;
    }

    /** Supprime le fichier du disque privé ; l'absence n'est pas une erreur. */
    public function deleteFile(): void
    {
        Storage::disk(Application::DISK)->delete($this->path);
    }

    protected static function booted(): void
    {
        // Supprimer la ligne emporte le fichier : aucun orphelin ne reste sur
        // le disque, y compris lors de la suppression en cascade d'un dossier.
        static::deleting(fn (self $document) => $document->deleteFile());
    }
}
