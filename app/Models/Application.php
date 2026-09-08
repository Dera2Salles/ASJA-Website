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

    /** Situation matrimoniale déclarée par le candidat. */
    public const MARITAL_STATUSES = [
        'celibataire' => 'Célibataire',
        'en_couple' => 'En couple',
        'marie' => 'Marié(e)',
    ];

    /** Seul « marié » ouvre la saisie de la CIN du conjoint. */
    public const MARITAL_MARRIED = 'marie';

    /**
     * Religions proposées. « Autre » ouvre un champ de précision : sans lui,
     * la valeur n'apprendrait rien à la scolarité.
     */
    public const RELIGIONS = [
        'catholique' => 'Catholique',
        'musulman' => 'Musulman',
        'autre' => 'Autre',
    ];

    public const RELIGION_OTHER = 'autre';

    /** Longueur exacte du numéro de CIN malgache. */
    public const CIN_LENGTH = 12;

    public const BAC_SERIES = ['A1', 'A2', 'C', 'D', 'S', 'L', 'OSE'];

    public const BAC_MENTIONS = [
        'passable' => 'Passable',
        'assez_bien' => 'Assez bien',
        'bien' => 'Bien',
        'tres_bien' => 'Très bien',
    ];

    /**
     * Champs déclarés par le candidat, selon le type de demande.
     *
     * Une réinscription ne redonne ni état civil, ni CIN, ni baccalauréat, ni
     * parents : tout cela est déjà au dossier depuis la première inscription,
     * et le ressaisir chaque année n'apprend rien à l'établissement. Il ne
     * reste que de quoi retrouver l'étudiant — son matricule — et de quoi lui
     * répondre — son adresse e-mail. Le reste de l'année tient dans les pièces
     * jointes.
     *
     * Comme `DOCUMENTS`, la liste fait foi des deux côtés : un champ hors de
     * celle de son type n'est pas seulement absent du formulaire, il est
     * refusé à l'envoi — une requête forgée ne doit pas réécrire un état civil
     * que le candidat n'a pas été invité à revoir.
     */
    public const FIELDS = [
        self::TYPE_PREMIERE => [
            'last_name', 'first_name', 'gender', 'nationality', 'birth_date',
            'birth_place', 'phone', 'email', 'marital_status', 'religion',
            'religion_other',
            'cin_number', 'cin_issued_place', 'cin_issued_at',
            'cin_duplicate_at', 'spouse_cin_number',
            'bac_year', 'bac_series', 'bac_number', 'bac_mention',
            'level', 'mention',
            'parent1_name', 'parent1_phone', 'parent2_name', 'parent2_phone',
        ],
        self::TYPE_REINSCRIPTION => ['student_number', 'email'],
    ];

    /**
     * Pièces justificatives.
     *
     * `for` dit à quels types de demande la pièce s'applique, `required` si
     * elle y est exigée. Les deux listes sont distinctes : une pièce peut être
     * proposée sans être obligatoire, mais une pièce hors de `for` n'est ni
     * demandée ni acceptée — le dossier d'une réinscription n'a pas à recevoir
     * le relevé de baccalauréat, déjà archivé depuis la première inscription.
     *
     * `extensions` restreint les formats quand la nature de la pièce l'impose :
     * une photo d'identité n'est pas un PDF.
     */
    public const DOCUMENTS = [
        'bac_transcript' => [
            'label' => 'Relevé de notes du Baccalauréat',
            'hint' => 'Version numérique du relevé délivré par l\'office du baccalauréat.',
            'for' => [self::TYPE_PREMIERE],
            'required' => [self::TYPE_PREMIERE],
        ],
        'cin' => [
            'label' => 'Photocopie de la CIN',
            'hint' => 'Recto et verso, dans un seul fichier de préférence.',
            'for' => [self::TYPE_PREMIERE],
            'required' => [self::TYPE_PREMIERE],
        ],
        'report_card' => [
            'label' => 'Photocopie du bulletin de notes',
            'hint' => 'Bulletin de l\'année universitaire écoulée, en version numérique.',
            'for' => [self::TYPE_REINSCRIPTION],
            'required' => [self::TYPE_REINSCRIPTION],
        ],
        'photo' => [
            'label' => 'Photo d\'identité en buste',
            'hint' => 'Photo récente en buste, format 4×4, sur fond uni.',
            'for' => [self::TYPE_REINSCRIPTION],
            'required' => [self::TYPE_REINSCRIPTION],
            // Une photo est une image : le PDF n'a pas sa place ici.
            'extensions' => ['jpg', 'jpeg', 'png', 'webp'],
        ],
        'payment_receipt' => [
            'label' => 'Bordereau de versement',
            // Le montant dépend du type de demande : il est annoncé par les
            // frais, à côté, plutôt que figé dans ce libellé.
            'hint' => 'Preuve du versement effectué sur le compte de l\'établissement.',
            'for' => [self::TYPE_PREMIERE, self::TYPE_REINSCRIPTION],
            'required' => [self::TYPE_PREMIERE, self::TYPE_REINSCRIPTION],
        ],
    ];

    /** Compte sur lequel les frais sont versés. */
    public const BANK_ACCOUNT = [
        'bank' => 'BOA',
        'holder' => 'ASJA',
        'number' => '141 374 400 17',
    ];

    /** Frais dus au dépôt : c'est leur bordereau que le dossier doit contenir. */
    public const FEE_AT_SUBMISSION = 'submission';

    /** Frais dus seulement une fois le dossier validé par l'établissement. */
    public const FEE_AFTER_VALIDATION = 'validation';

    /**
     * Frais à verser, en ariary, selon le type de demande et le moment.
     *
     * Le moment fait toute la différence pour le candidat. Une première
     * inscription ne verse d'abord que les frais de dossier : c'est ce
     * bordereau-là, et lui seul, qui accompagne la demande ; les frais généraux
     * ne sont dus qu'une fois le dossier validé — les réclamer d'emblée
     * ferait payer 210 000 Ar une candidature qui peut être refusée. Une
     * réinscription, elle, porte sur un étudiant déjà admis : il n'y a rien à
     * valider avant, et les frais généraux se versent au dépôt.
     *
     * Le montant est gardé en entier — jamais en chaîne déjà mise en forme —
     * pour que les sommes se calculent et que la mise en forme reste au seul
     * endroit qui affiche.
     */
    public const FEES = [
        self::TYPE_PREMIERE => [
            [
                'label' => 'Frais de dossier',
                'amount' => 20000,
                'when' => self::FEE_AT_SUBMISSION,
            ],
            [
                'label' => 'Frais généraux',
                'amount' => 210000,
                'when' => self::FEE_AFTER_VALIDATION,
            ],
        ],
        self::TYPE_REINSCRIPTION => [
            [
                'label' => 'Frais généraux',
                'amount' => 210000,
                'when' => self::FEE_AT_SUBMISSION,
            ],
        ],
    ];

    /** Quand chaque frais est dû, en français. */
    public const FEE_MOMENTS = [
        self::FEE_AT_SUBMISSION => 'Au dépôt du dossier',
        self::FEE_AFTER_VALIDATION => 'Après validation du dossier',
    ];

    /** Monnaie des frais, affichée telle quelle. */
    public const CURRENCY = 'Ar';

    /** Extensions acceptées par défaut, quand la pièce n'en impose pas d'autres. */
    public const DOCUMENT_EXTENSIONS = ['pdf', 'jpg', 'jpeg', 'png', 'webp'];

    /** Taille maximale d'une pièce, en kilo-octets (5 Mo). */
    public const DOCUMENT_MAX_KB = 5120;

    /** Disque privé où atterrissent les pièces : jamais servi par Apache. */
    public const DISK = 'local';

    protected $fillable = [
        'reference', 'idempotency_key', 'type', 'status', 'user_id',
        'last_name', 'first_name', 'gender', 'nationality', 'birth_date',
        'birth_place', 'phone', 'email', 'religion', 'religion_other',
        'marital_status', 'cin_number', 'cin_issued_place', 'cin_issued_at',
        'cin_duplicate_at', 'spouse_cin_number',
        'bac_year', 'bac_series', 'bac_number', 'bac_mention',
        'level', 'department_id', 'mention', 'mention_name',
        'student_number', 'previous_level',
        'parent1_name', 'parent1_phone', 'parent2_name', 'parent2_phone',
        'admin_note', 'submitted_at', 'receipt_sent_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'cin_issued_at' => 'date',
        'cin_duplicate_at' => 'date',
        'bac_year' => 'integer',
        'submitted_at' => 'datetime',
        'receipt_sent_at' => 'datetime',
    ];

    protected $appends = [
        'full_name', 'display_name', 'type_label', 'status_label',
        'marital_status_label', 'religion_label',
    ];

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

    /**
     * Intitulé du dossier dans les listes et les en-têtes.
     *
     * Une réinscription ne déclare pas d'état civil : le nom est vide, et
     * c'est le matricule qui désigne l'étudiant. Le numéro de demande sert de
     * dernier recours, pour qu'une ligne ne soit jamais anonyme à l'écran.
     */
    public function getDisplayNameAttribute(): string
    {
        return $this->full_name
            ?: ($this->student_number
                ? 'Matricule ' . $this->student_number
                : $this->reference);
    }

    public function getTypeLabelAttribute(): string
    {
        return self::TYPES[$this->type] ?? $this->type;
    }

    public function getStatusLabelAttribute(): string
    {
        return self::STATUSES[$this->status] ?? $this->status;
    }

    public function getMaritalStatusLabelAttribute(): ?string
    {
        return $this->marital_status
            ? (self::MARITAL_STATUSES[$this->marital_status] ?? $this->marital_status)
            : null;
    }

    /**
     * Religion affichée. « Autre » cède la place à la précision saisie, et une
     * valeur libre héritée d'avant la liste de choix ressort telle quelle.
     */
    public function getReligionLabelAttribute(): ?string
    {
        if ($this->religion === self::RELIGION_OTHER) {
            return $this->religion_other ?: self::RELIGIONS[self::RELIGION_OTHER];
        }

        return $this->religion
            ? (self::RELIGIONS[$this->religion] ?? $this->religion)
            : null;
    }

    public function isMarried(): bool
    {
        return $this->marital_status === self::MARITAL_MARRIED;
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

        return array_values(array_diff(static::requiredDocuments($this->type), $present));
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
            'maritalStatuses' => static::labelled(self::MARITAL_STATUSES),
            'religions' => static::labelled(self::RELIGIONS),
            'cinLength' => self::CIN_LENGTH,
            'bacSeries' => self::BAC_SERIES,
            'bacMentions' => static::labelled(self::BAC_MENTIONS),
            'levels' => StudentFile::LEVELS,
            'mentions' => StudentFile::mentions(),
            'documents' => static::documentSpecs(),
            'fees' => static::feeSpecs(),
            'bankAccount' => self::BANK_ACCOUNT,
            'maxFileSizeKb' => self::DOCUMENT_MAX_KB,
            'acceptedExtensions' => self::DOCUMENT_EXTENSIONS,
        ];
    }

    /**
     * Pièces mises à plat pour le front : chacune dit à quels types de demande
     * elle s'applique, où elle est exigée, et les formats qu'elle accepte.
     */
    public static function documentSpecs(): array
    {
        $specs = [];

        foreach (self::DOCUMENTS as $type => $document) {
            $specs[] = [
                'type' => $type,
                'label' => $document['label'],
                'hint' => $document['hint'],
                'appliesTo' => $document['for'],
                'requiredFor' => $document['required'],
                'extensions' => static::documentExtensions($type),
            ];
        }

        return $specs;
    }

    /**
     * Frais d'un type de demande, mis en forme pour l'affichage.
     *
     * @return array<int, array{label: string, amount: int, formatted: string, when: string, moment: string}>
     */
    public static function feesFor(?string $applicationType, ?string $when = null): array
    {
        return collect(self::FEES[$applicationType] ?? [])
            ->when($when, fn ($fees) => $fees->where('when', $when))
            ->map(fn (array $fee) => [
                ...$fee,
                'formatted' => static::money($fee['amount']),
                'moment' => self::FEE_MOMENTS[$fee['when']],
            ])
            ->values()
            ->all();
    }

    /**
     * Somme due à un moment donné, mise en forme — nulle s'il n'y a rien à
     * verser à ce moment-là, pour que l'affichage taise la ligne plutôt que
     * d'annoncer « 0 Ar ».
     */
    public static function feeDue(?string $applicationType, string $when): ?string
    {
        $amount = collect(self::FEES[$applicationType] ?? [])
            ->where('when', $when)
            ->sum('amount');

        return $amount > 0 ? static::money($amount) : null;
    }

    /** Un montant en ariary : « 210 000 Ar », espace fine insécable comprise. */
    public static function money(int $amount): string
    {
        return number_format($amount, 0, ',', "\u{202f}") . "\u{a0}" . self::CURRENCY;
    }

    /** Frais de tous les types, pour le formulaire public. */
    public static function feeSpecs(): array
    {
        return collect(array_keys(self::TYPES))
            ->mapWithKeys(fn (string $type) => [$type => [
                'lines' => static::feesFor($type),

                /* Ce qu'il faut verser maintenant, et ce qui attendra : le
                   bordereau joint au dossier est celui du premier montant. */
                'dueAtSubmission' => static::feeDue($type, self::FEE_AT_SUBMISSION),
                'dueAfterValidation' => static::feeDue($type, self::FEE_AFTER_VALIDATION),
            ]])
            ->all();
    }

    /** Formats acceptés par une pièce donnée. */
    public static function documentExtensions(string $type): array
    {
        return self::DOCUMENTS[$type]['extensions'] ?? self::DOCUMENT_EXTENSIONS;
    }

    /**
     * Le champ est-il demandé pour ce type de demande ?
     *
     * Un type inconnu est traité comme une première inscription, la demande la
     * plus large : la règle portée par `type` signale déjà la valeur invalide,
     * inutile d'y ajouter « ce champ n'est pas demandé » sur tout le
     * formulaire.
     */
    public static function fieldApplies(string $field, ?string $applicationType): bool
    {
        return in_array(
            $field,
            self::FIELDS[$applicationType] ?? self::FIELDS[self::TYPE_PREMIERE],
            true
        );
    }

    /** La pièce est-elle demandée pour ce type de demande ? */
    public static function documentApplies(string $type, ?string $applicationType): bool
    {
        return in_array($applicationType, self::DOCUMENTS[$type]['for'] ?? [], true);
    }

    /**
     * Pièces obligatoires pour un type de demande.
     *
     * @return array<int, string>
     */
    public static function requiredDocuments(?string $applicationType): array
    {
        return array_keys(array_filter(
            self::DOCUMENTS,
            fn (array $document) => in_array($applicationType, $document['required'], true)
        ));
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
