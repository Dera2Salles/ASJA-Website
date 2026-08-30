<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

/**
 * Une publication : article, annonce ou événement.
 *
 * Les trois partagent le même cycle de vie (rédaction, programmation,
 * publication) ; seuls les champs d'événement (dates, lieu) sont spécifiques.
 */
class Post extends Model
{
    public const TYPE_ARTICLE = 'article';
    public const TYPE_ANNONCE = 'annonce';
    public const TYPE_EVENEMENT = 'evenement';

    public const TYPES = [
        self::TYPE_ARTICLE,
        self::TYPE_ANNONCE,
        self::TYPE_EVENEMENT,
    ];

    protected $fillable = [
        'user_id', 'type', 'title', 'slug', 'excerpt', 'content',
        'cover_image', 'category', 'tags', 'is_published', 'is_pinned',
        'published_at', 'event_start_at', 'event_end_at', 'location',
    ];

    protected $casts = [
        'tags' => 'array',
        'is_published' => 'boolean',
        'is_pinned' => 'boolean',
        'published_at' => 'datetime',
        'event_start_at' => 'datetime',
        'event_end_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::saving(function (self $post) {
            if (empty($post->slug)) {
                $post->slug = static::uniqueSlug($post->title, $post->id);
            }
        });
    }

    /** Garantit l'unicité du slug, la colonne portant un index unique. */
    public static function uniqueSlug(string $title, ?int $ignoreId = null): string
    {
        $base = Str::slug($title) ?: 'publication';
        $slug = $base;
        $i = 2;

        while (static::where('slug', $slug)
            ->when($ignoreId, fn ($q) => $q->whereKeyNot($ignoreId))
            ->exists()) {
            $slug = "{$base}-{$i}";
            $i++;
        }

        return $slug;
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    /**
     * Publications réellement visibles du public : publiées et dont la date de
     * programmation est atteinte. Les épinglées remontent en tête.
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('is_published', true)
            ->where(function (Builder $q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            })
            ->orderByDesc('is_pinned')
            ->orderByDesc('published_at');
    }

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /** Événements à venir ou en cours, du plus proche au plus lointain. */
    public function scopeUpcoming(Builder $query): Builder
    {
        return $query->where('type', self::TYPE_EVENEMENT)
            ->where(function (Builder $q) {
                $q->where('event_end_at', '>=', now())
                    ->orWhere(function (Builder $q2) {
                        $q2->whereNull('event_end_at')->where('event_start_at', '>=', now());
                    });
            })
            ->reorder()
            ->orderBy('event_start_at');
    }
}
