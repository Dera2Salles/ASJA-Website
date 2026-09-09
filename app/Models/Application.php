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

    /**
     * Bordereau des frais généraux reçu, en attente de vérification.
     *
     * Il s'intercale entre « Acceptée » et « Finalisée » : sans lui, le dossier
     * dont le versement vient d'arriver serait indiscernable de celui qui n'a
     * rien envoyé, et le candidat pourrait redéposer son bordereau indéfiniment.
     */
    public const STATUS_FEES_SUBMITTED = 'fees_submitted';

    /** Statuts dans l'ordre du parcours d'instruction. */
    public const STATUSES = [
        self::STATUS_PENDING => 'En attente',
        self::STATUS_PROCESSING => 'En cours de traitement',
        self::STATUS_INCOMPLETE => 'À compléter',
        self::STATUS_ACCEPTED => 'Acceptée',
        self::STATUS_FEES_SUBMITTED => 'Bordereau reçu',
        self::STATUS_REJECTED => 'Refusée',
        self::STATUS_FINALIZED => 'Finalisée',
    ];

    /**
     * Statuts qui ouvrent le parcours de complétion au candidat.
     *
     * Un seul aujourd'hui, mais la liste dit l'intention : c'est le statut, et
     * lui seul, qui autorise un dépôt supplémentaire. Le contrôleur ne consulte
     * jamais autre chose.
     */
    public const COMPLETABLE_STATUSES = [self::STATUS_INCOMPLETE];

    /**
     * Statuts qui ouvrent le dépôt du bordereau des frais généraux.
     *
     * Le dossier est validé, les frais généraux sont dus : c'est le moment, et
     * le seul. Avant, le candidat verserait pour un dossier qui peut être
     * refusé ; après, le bordereau est déjà au dossier.
     */
    public const FEES_STATUSES = [self::STATUS_ACCEPTED];

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
     * De quoi réafficher un champ hors du formulaire de dépôt.
     *
     * Le grand formulaire dessine chaque champ à la main, ce qui lui va : il
     * les connaît tous, et chacun a sa place dans son étape. Le parcours de
     * complétion, lui, n'apprend qu'à l'exécution lesquels sont rouverts — il
     * lui faut donc, pour un nom de champ, de quoi le dessiner : son intitulé,
     * la nature de sa saisie, et le référentiel qui la contraint quand elle est
     * un choix. `options` nomme une clé de `formOptions()`, jamais une liste
     * écrite ici : les mentions viennent de la base, et doivent le rester.
     */
    public const FIELD_SPECS = [
        'last_name' => ['label' => 'Nom', 'input' => 'text'],
        'first_name' => ['label' => 'Prénom', 'input' => 'text'],
        'gender' => ['label' => 'Sexe', 'input' => 'select', 'options' => 'genders'],
        'nationality' => ['label' => 'Nationalité', 'input' => 'text'],
        'birth_date' => ['label' => 'Date de naissance', 'input' => 'date'],
        'birth_place' => ['label' => 'Lieu de naissance', 'input' => 'text'],
        'phone' => ['label' => 'Numéro de téléphone', 'input' => 'tel'],
        'email' => ['label' => 'Adresse e-mail', 'input' => 'email'],
        'marital_status' => ['label' => 'Situation matrimoniale', 'input' => 'select', 'options' => 'maritalStatuses'],
        'religion' => ['label' => 'Religion', 'input' => 'select', 'options' => 'religions'],
        'religion_other' => ['label' => 'Précision sur la religion', 'input' => 'text'],
        'cin_number' => ['label' => 'Numéro de CIN', 'input' => 'text'],
        'cin_issued_place' => ['label' => 'Lieu de délivrance de la CIN', 'input' => 'text'],
        'cin_issued_at' => ['label' => 'Date de délivrance de la CIN', 'input' => 'date'],
        'cin_duplicate_at' => ['label' => 'Date du duplicata de la CIN', 'input' => 'date'],
        'spouse_cin_number' => ['label' => 'Numéro de CIN du conjoint', 'input' => 'text'],
        'bac_year' => ['label' => 'Année d\'obtention du baccalauréat', 'input' => 'number'],
        'bac_series' => ['label' => 'Série du baccalauréat', 'input' => 'select', 'options' => 'bacSeries'],
        'bac_number' => ['label' => 'Numéro du baccalauréat', 'input' => 'text'],
        'bac_mention' => ['label' => 'Mention du baccalauréat', 'input' => 'select', 'options' => 'bacMentions'],
        'level' => ['label' => 'Niveau', 'input' => 'select', 'options' => 'levels'],
        'mention' => ['label' => 'Mention', 'input' => 'select', 'options' => 'mentions'],
        'student_number' => ['label' => 'Numéro matricule', 'input' => 'text'],
        'previous_level' => ['label' => 'Niveau précédent', 'input' => 'select', 'options' => 'levels'],
        'parent1_name' => ['label' => 'Nom et prénom du père', 'input' => 'text'],
        'parent1_phone' => ['label' => 'Téléphone du père', 'input' => 'tel'],
        'parent2_name' => ['label' => 'Nom et prénom de la mère', 'input' => 'text'],
        'parent2_phone' => ['label' => 'Téléphone de la mère', 'input' => 'tel'],
    ];

    /**
     * Moment où une pièce est attendue.
     *
     * Ce sont les moments des frais, et pour cause : la pièce attendue après
     * validation est le bordereau du versement qui, lui aussi, n'est dû qu'à ce
     * moment-là. Les deux listes se lisent donc avec la même clé.
     */
    public const STAGE_AT_SUBMISSION = self::FEE_AT_SUBMISSION;

    public const STAGE_AFTER_VALIDATION = self::FEE_AFTER_VALIDATION;

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

        /*
         * Bordereau des frais généraux — attendu après validation du dossier,
         * jamais au dépôt.
         *
         * Une réinscription n'en a pas : elle verse ses frais généraux
         * d'emblée, et son bordereau est celui du dessus. Une première
         * inscription, elle, ne verse d'abord que les frais de dossier ; les
         * 210 000 Ar ne sont dus qu'une fois la candidature retenue, et c'est
         * ce versement-là que cette pièce prouve.
         *
         * L'étape est ce qui l'exclut du formulaire de dépôt : `stage` la
         * range après validation, et `StoreApplicationRequest` refuse tout ce
         * qui n'est pas de l'étape du dépôt.
         */
        'general_fees_receipt' => [
            'label' => 'Bordereau de versement des frais généraux',
            'hint' => 'Preuve du versement des frais généraux, effectué après la validation de votre dossier.',
            'for' => [self::TYPE_PREMIERE],
            'required' => [self::TYPE_PREMIERE],
            'stage' => self::STAGE_AFTER_VALIDATION,
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
        'requested_documents', 'requested_fields', 'completion_message',
        'completion_requested_at', 'completed_at', 'fees_receipt_at',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'cin_issued_at' => 'date',
        'cin_duplicate_at' => 'date',
        'bac_year' => 'integer',
        'submitted_at' => 'datetime',
        'receipt_sent_at' => 'datetime',
        'requested_documents' => 'array',
        'requested_fields' => 'array',
        'completion_requested_at' => 'datetime',
        'completed_at' => 'datetime',
        'fees_receipt_at' => 'datetime',
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

    /* --- Suivi du dossier ------------------------------------------------ */

    /** La pièce d'une nature donnée, si elle est au dossier. */
    public function document(string $type): ?ApplicationDocument
    {
        return $this->documents->firstWhere('type', $type);
    }

    /**
     * Nature du bordereau des frais généraux pour ce dossier, s'il en attend un.
     *
     * Nulle pour une réinscription : elle verse tout au dépôt, et son bordereau
     * est déjà au dossier. La liste des pièces fait foi — c'est elle qui dit
     * quelle pièce est attendue après validation, et pour quel type.
     */
    public function feesDocumentType(): ?string
    {
        foreach (array_keys(self::DOCUMENTS) as $type) {
            if (static::documentApplies($type, $this->type, self::STAGE_AFTER_VALIDATION)) {
                return $type;
            }
        }

        return null;
    }

    /**
     * Pièces réellement réclamées au candidat.
     *
     * La colonne est relue à travers la liste des pièces : une nature retirée
     * du référentiel, ou qui ne concerne pas ce type de demande, ne doit pas
     * rouvrir un dépôt au motif qu'elle traîne en base depuis une ancienne
     * instruction.
     *
     * @return array<int, string>
     */
    public function requestedDocumentTypes(): array
    {
        return array_values(array_filter(
            $this->requested_documents ?? [],
            fn ($type) => is_string($type) && static::documentApplies($type, $this->type)
        ));
    }

    /**
     * Champs réellement rouverts à la correction, filtrés de la même façon.
     *
     * @return array<int, string>
     */
    public function requestedFieldNames(): array
    {
        return array_values(array_filter(
            $this->requested_fields ?? [],
            fn ($field) => is_string($field) && static::fieldApplies($field, $this->type)
        ));
    }

    /**
     * Le dossier attend-il un complément du candidat ?
     *
     * Le statut commande, et rien d'autre : c'est lui que l'administration
     * pose, et lui seul que le contrôleur relit avant d'accepter un dépôt.
     */
    public function awaitsCompletion(): bool
    {
        return in_array($this->status, self::COMPLETABLE_STATUSES, true);
    }

    /**
     * Le dossier attend-il le bordereau des frais généraux ?
     *
     * Trois conditions, toutes nécessaires : le dossier est validé, son type
     * doit ce versement, et le bordereau n'est pas déjà arrivé. La dernière
     * ferme le double envoi — le statut passe d'ailleurs à « Bordereau reçu »
     * dès le premier, mais un dossier remis en « Acceptée » par erreur ne doit
     * pas rouvrir la porte pour autant.
     */
    public function awaitsFeesReceipt(): bool
    {
        return in_array($this->status, self::FEES_STATUSES, true)
            && $this->feesDocumentType() !== null
            && $this->fees_receipt_at === null;
    }

    /**
     * Seule action ouverte au candidat sur ce dossier : `complete`, `fees`, ou
     * rien. Le front s'y règle, mais ne décide de rien — il lit ce que le
     * serveur a conclu.
     */
    public function openAction(): ?string
    {
        if ($this->awaitsCompletion()) {
            return 'complete';
        }

        return $this->awaitsFeesReceipt() ? 'fees' : null;
    }

    /**
     * Le demandeur se reconnaît-il par cette adresse ?
     *
     * Le numéro de demande ne suffit pas à ouvrir un dossier : il est
     * séquentiel, donc devinable. L'adresse e-mail déclarée au dépôt fait le
     * second facteur — comparée sans égard à la casse, comme elle est
     * normalisée à l'entrée.
     */
    public function belongsToApplicant(string $email): bool
    {
        return mb_strtolower(trim($email)) === mb_strtolower((string) $this->email);
    }

    /**
     * Le parcours du dossier, tel qu'il est montré au candidat.
     *
     * Un dossier refusé s'arrête où il a été refusé : afficher les étapes
     * suivantes en « à venir » laisserait croire qu'elles arriveront. Les
     * frais généraux ne figurent que pour les types qui les doivent après
     * validation — une réinscription les a déjà versés au dépôt.
     *
     * @return array<int, array{key: string, label: string, description: string, state: string}>
     */
    public function timeline(): array
    {
        $rank = [
            self::STATUS_PENDING => 1,
            self::STATUS_PROCESSING => 2,
            self::STATUS_INCOMPLETE => 2,
            self::STATUS_ACCEPTED => 3,
            self::STATUS_FEES_SUBMITTED => 4,
            self::STATUS_FINALIZED => 5,
            self::STATUS_REJECTED => 3,
        ];

        $reached = $rank[$this->status] ?? 1;
        $rejected = $this->status === self::STATUS_REJECTED;

        $steps = [
            ['key' => 'submitted', 'rank' => 1,
                'label' => 'Dossier déposé',
                'description' => 'Votre demande est enregistrée et son numéro vous a été communiqué.'],
            ['key' => 'review', 'rank' => 2,
                'label' => 'Examen du dossier',
                'description' => 'Le service de la scolarité vérifie vos informations et vos pièces.'],
            ['key' => 'decision', 'rank' => 3,
                'label' => $rejected ? 'Dossier refusé' : 'Dossier validé',
                'description' => $rejected
                    ? 'La demande n\'a pas été retenue. Le bureau de la scolarité peut vous en dire les motifs.'
                    : 'Votre dossier est complet et retenu par l\'établissement.'],
        ];

        if ($this->feesDocumentType() !== null) {
            $steps[] = ['key' => 'fees', 'rank' => 4,
                'label' => 'Frais généraux',
                'description' => 'Versement des frais généraux et transmission du bordereau.'];
        }

        $steps[] = ['key' => 'finalized', 'rank' => 5,
            'label' => 'Inscription finalisée',
            'description' => 'Votre inscription est enregistrée par le bureau de la scolarité.'];

        return array_map(function (array $step) use ($reached, $rejected) {
            $state = match (true) {
                $rejected && $step['rank'] > 3 => 'blocked',
                $rejected && $step['rank'] === 3 => 'rejected',
                $step['rank'] < $reached => 'done',
                $step['rank'] === $reached => 'current',
                default => 'todo',
            };

            return [
                'key' => $step['key'],
                'label' => $step['label'],
                'description' => $step['description'],
                'state' => $state,
            ];
        }, $steps);
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
     *
     * L'étape filtre : le formulaire de dépôt ne doit connaître que les pièces
     * du dépôt, sans quoi il proposerait le bordereau des frais généraux à un
     * candidat dont le dossier n'est pas encore instruit. `null` rend la liste
     * entière, ce dont l'administration a besoin pour nommer une pièce quelle
     * que soit son étape.
     */
    public static function documentSpecs(?string $stage = self::STAGE_AT_SUBMISSION): array
    {
        $specs = [];

        foreach (self::DOCUMENTS as $type => $document) {
            if ($stage !== null && static::documentStage($type) !== $stage) {
                continue;
            }

            $specs[] = [
                'type' => $type,
                'label' => $document['label'],
                'hint' => $document['hint'],
                'appliesTo' => $document['for'],
                'requiredFor' => $document['required'],
                'extensions' => static::documentExtensions($type),
                'stage' => static::documentStage($type),
            ];
        }

        return $specs;
    }

    /**
     * De quoi dessiner une poignée de champs rouverts à la correction.
     *
     * Les référentiels sont ramenés à une seule forme — `value` / `label` —
     * pour que le front n'ait qu'un cas à traiter : les mentions arrivent en
     * `slug`/`name` de la base, les niveaux et les séries en simples chaînes,
     * et rien de tout cela ne regarde l'écran qui les affiche.
     *
     * @param  array<int, string>  $fields
     * @return array<int, array{name: string, label: string, input: string, options: array<int, array{value: string, label: string}>|null}>
     */
    public static function fieldSpecsFor(array $fields): array
    {
        $referentials = [
            'genders' => static::labelled(self::GENDERS),
            'maritalStatuses' => static::labelled(self::MARITAL_STATUSES),
            'religions' => static::labelled(self::RELIGIONS),
            'bacMentions' => static::labelled(self::BAC_MENTIONS),
            'bacSeries' => static::plainOptions(self::BAC_SERIES),
            'levels' => static::plainOptions(StudentFile::LEVELS),
            'mentions' => collect(StudentFile::mentions())
                ->map(fn (array $mention) => [
                    'value' => $mention['slug'],
                    'label' => $mention['name'],
                ])
                ->all(),
        ];

        return collect($fields)
            ->filter(fn (string $field) => isset(self::FIELD_SPECS[$field]))
            ->map(fn (string $field) => [
                'name' => $field,
                'label' => self::FIELD_SPECS[$field]['label'],
                'input' => self::FIELD_SPECS[$field]['input'],
                'options' => isset(self::FIELD_SPECS[$field]['options'])
                    ? $referentials[self::FIELD_SPECS[$field]['options']]
                    : null,
            ])
            ->values()
            ->all();
    }

    /**
     * Étape à laquelle une pièce est attendue.
     *
     * Le dépôt est le cas de loin le plus courant : il est donc le défaut, et
     * seules les pièces d'un autre moment portent la clé.
     */
    public static function documentStage(string $type): string
    {
        return self::DOCUMENTS[$type]['stage'] ?? self::STAGE_AT_SUBMISSION;
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

    /**
     * La pièce est-elle demandée pour ce type de demande, à cette étape ?
     *
     * Le type dit *si* la pièce existe pour ce dossier, l'étape dit *quand*
     * elle est recevable. Les deux comptent : le bordereau des frais généraux
     * concerne bien une première inscription, mais le déposer au moment du
     * dossier n'aurait aucun sens — le versement n'est pas encore dû.
     */
    public static function documentApplies(
        string $type,
        ?string $applicationType,
        ?string $stage = self::STAGE_AT_SUBMISSION
    ): bool {
        if ($stage !== null && static::documentStage($type) !== $stage) {
            return false;
        }

        return in_array($applicationType, self::DOCUMENTS[$type]['for'] ?? [], true);
    }

    /**
     * Pièces obligatoires pour un type de demande, à une étape donnée.
     *
     * @return array<int, string>
     */
    public static function requiredDocuments(
        ?string $applicationType,
        ?string $stage = self::STAGE_AT_SUBMISSION
    ): array {
        return array_keys(array_filter(
            self::DOCUMENTS,
            fn (array $document, string $type) => static::documentApplies($type, $applicationType, $stage)
                && in_array($applicationType, $document['required'], true),
            ARRAY_FILTER_USE_BOTH
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
     * Une liste de valeurs nues — les niveaux, les séries — ramenée à la forme
     * commune, où la valeur est aussi son propre intitulé.
     *
     * @param  array<int, string>  $values
     * @return array<int, array{value: string, label: string}>
     */
    private static function plainOptions(array $values): array
    {
        return array_map(
            fn (string $value) => ['value' => $value, 'label' => $value],
            $values
        );
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
