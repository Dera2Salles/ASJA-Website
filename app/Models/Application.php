<?php

namespace App\Models;

use App\Support\StudentFile;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\DB;

/**
 * Une demande d'inscription ou de réinscription déposée en ligne.
 *
 * Le modèle porte aussi les référentiels du formulaire (types, séries du
 * baccalauréat, mentions, statuts, pièces attendues) : le formulaire public, la
 * validation serveur, l'accusé de réception et l'administration lisent tous la
 * même liste. Écrite en double, elle aurait divergé au premier ajout.
 */
class Application extends Model
{
    /* --- Type de demande ------------------------------------------------ */

    public const TYPE_PREMIERE = 'premiere_inscription';

    public const TYPE_REINSCRIPTION = 'reinscription';

    public const TYPES = [
        self::TYPE_PREMIERE => 'Première inscription',
        self::TYPE_REINSCRIPTION => 'Réinscription',
    ];

    /* --- Statut du dossier ---------------------------------------------- */

    public const STATUS_PENDING = 'pending';

    public const STATUS_PROCESSING = 'processing';

    public const STATUS_ACCEPTED = 'accepted';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_INCOMPLETE = 'incomplete';

    public const STATUS_FINALIZED = 'finalized';

    /** Statuts dans l'ordre du parcours d'instruction. */
    public const STATUSES = [
        self::STATUS_PENDING => 'En attente',
        self::STATUS_PROCESSING => 'En cours de traitement',
        self::STATUS_INCOMPLETE => 'À compléter',
        self::STATUS_ACCEPTED => 'Acceptée',
        self::STATUS_REJECTED => 'Refusée',
        self::STATUS_FINALIZED => 'Finalisée',
    ];

    /* --- Référentiels du formulaire ------------------------------------- */

    public const GENDERS = ['M' => 'Masculin', 'F' => 'Féminin'];

    public const BAC_SERIES = ['A1', 'A2', 'C', 'D', 'S', 'L', 'OSE'];

    public const BAC_MENTIONS = [
        'passable' => 'Passable',
        'assez_bien' => 'Assez bien',
        'bien' => 'Bien',
        'tres_bien' => 'Très bien',
    ];

    /**
     * Pièces justificatives attendues.
     *
     * `required` énumère les types de demande pour lesquels la pièce est
     * exigée : à la réinscription, le relevé du baccalauréat et la CIN sont
     * déjà au dossier de l'étudiant, seul le bordereau de versement de
     * l'année en cours reste obligatoire.
     */
    public const DOCUMENTS = [
        'bac_transcript' => [
            'label' => 'Relevé de notes du Baccalauréat',
            'hint' => 'Version numérique du relevé délivré par l\'office du baccalauréat.',
            'required' => [self::TYPE_PREMIERE],
        ],
        'cin' => [
            'label' => 'Photocopie de la CIN',
            'hint' => 'Recto et verso, dans un seul fichier de préférence.',
            'required' => [self::TYPE_PREMIERE],
        ],
        'payment_receipt' => [
            'label' => 'Bordereau de versement',
            'hint' => 'Preuve du versement des frais de dossier.',
            'required' => [self::TYPE_PREMIERE, self::TYPE_REINSCRIPTION],
        ],
    ];

    /** Extensions acceptées pour toute pièce justificative. */
    public const DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    /** Taille maximale d'une pièce, en kilo-octets (5 Mo). */
    public const DOCUMENT_MAX_KB = 5120;

    /** Disque privé où atterrissent les pièces : jamais servi par Apache. */
    public const DISK = 'local';

    protected $fillable = [
        'reference', 'idempotency_key', 'type', 'status', 'user_id',
        'last_name', 'first_name', 'gender', 'nationality', 'birth_date',
        'birth_place', 'phone', 'email', 'religion',
        'bac_year', 'bac_series', 'bac_number', 'bac_mention',
        'level', 'department_id', 'mention', 'mention_name',
        'student_number', 'previous_level',
        'parent1_name', 'parent1_phone', 'parent2_name', 'parent2_phone',
        'admin_note', 'submitted_at', 'receipt_sent_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'bac_year' => 'integer',
        'submitted_at' => 'datetime',
        'receipt_sent_at' => 'datetime',
    ];

    protected $appends = ['full_name', 'type_label', 'status_label'];

    protected static function booted(): void
    {
        /* La cascade est déclarée en base, mais une suppression SQL ne
           déclenche aucun événement Eloquent : les fichiers seraient restés
           sur le disque. On passe donc par la relation, qui laisse chaque
           pièce supprimer le sien. */
        static::deleting(function (self $application) {
            $application->documents->each->delete();
        });
    }

    /* --- Relations ------------------------------------------------------ */

    public function documents(): HasMany
    {
        return $this->hasMany(ApplicationDocument::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /* --- Libellés ------------------------------------------------------- */

    public function getFullNameAttribute(): string
    {
        return trim($this->first_name . ' ' . $this->last_name);
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    /* --- Portées -------------------------------------------------------- */

    public function scopeStatus(Builder $query, ?string $status): Builder
    {
        return $status ? $query->where('status', $status) : $query;
    }

    /**
     * Dossier incomplet : une pièce obligatoire pour ce type de demande
     * manque. La validation la refuse à la soumission, mais un dossier peut
     * aussi devenir incomplet après coup — pièce illisible supprimée par
     * l'administration, par exemple.
     */
    public function missingDocuments(): array
    {
        $present = $this->documents->pluck('type')->all();

        return array_keys(array_filter(
            self::DOCUMENTS,
            fn (array $document, string $type) => in_array($this->type, $document['required'], true)
                && ! in_array($type, $present, true),
            ARRAY_FILTER_USE_BOTH
        ));
    }

    /* --- Numéro de demande ---------------------------------------------- */

    /**
     * Numéro de demande de l'année en cours, séquentiel : `ASJA-2026-0001`.
     *
     * Le compteur est lu puis réservé dans la même transaction que l'écriture
     * de la demande (voir le contrôleur) ; l'index unique de la colonne reste
     * le dernier rempart en cas de collision, et la boucle réessaie.
     */
    public static function nextReference(): string
    {
        $year = now()->year;
        $prefix = 'ASJA-' . $year . '-';

        $last = static::where('reference', 'like', $prefix . '%')
            ->orderByDesc('reference')
            ->value('reference');

        $sequence = $last ? ((int) substr($last, strlen($prefix))) + 1 : 1;

        return $prefix . str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    /**
     * Référentiels envoyés au formulaire public.
     *
     * Les mentions viennent de la table `departments` via `StudentFile`, jamais
     * d'une liste écrite en dur : une mention ajoutée depuis l'administration
     * apparaît aussitôt dans le formulaire.
     */
    public static function formOptions(): array
    {
        return [
            'types' => static::labelled(self::TYPES),
            'genders' => static::labelled(self::GENDERS),
            'bacSeries' => self::BAC_SERIES,
            'bacMentions' => static::labelled(self::BAC_MENTIONS),
            'levels' => StudentFile::LEVELS,
            'mentions' => StudentFile::mentions(),
            'documents' => static::documentSpecs(),
            'maxFileSizeKb' => self::DOCUMENT_MAX_KB,
            'acceptedExtensions' => self::DOCUMENT_EXTENSIONS,
        ];
    }

    /** Pièces attendues, mises à plat pour le front. */
    public static function documentSpecs(): array
    {
        $specs = [];

        foreach (self::DOCUMENTS as $type => $document) {
            $specs[] = [
                'type' => $type,
                'label' => $document['label'],
                'hint' => $document['hint'],
                'requiredFor' => $document['required'],
            ];
        }

        return $specs;
    }

    /** @return array<int, array{value: string, label: string}> */
    private static function labelled(array $map): array
    {
        return collect($map)
            ->map(fn (string $label, string $value) => ['value' => $value, 'label' => $label])
            ->values()
            ->all();
    }

    /**
     * Réserve un numéro et crée la demande dans une seule transaction.
     *
     * Deux dépôts simultanés lisaient sinon le même dernier numéro et
     * tentaient d'écrire la même référence ; la seconde échouait sur l'index
     * unique et le candidat voyait une erreur serveur. On réessaie plutôt.
     */
    public static function createWithReference(array $attributes, int $attempts = 5): self
    {
        for ($attempt = 1; ; $attempt++) {
            try {
                return DB::transaction(fn () => static::create([
                    'reference' => static::nextReference(),
                    ...$attributes,
                ]));
            } catch (\Illuminate\Database\UniqueConstraintViolationException $e) {
                // Le jeton d'idempotence a sa propre gestion, en amont : ici,
                // seule une collision de référence justifie un nouvel essai.
                if ($attempt >= $attempts || ! str_contains($e->getMessage(), 'reference')) {
                    throw $e;
                }
            }
        }
    }
}
