<?php

namespace App\Http\Requests\Concerns;

use App\Models\Application;
use App\Models\Department;
use App\Support\StudentFile;
use Illuminate\Validation\Rule;

/**
 * Règles de validation d'un champ ou d'une pièce de candidature.
 *
 * Le dépôt initial n'est plus le seul à valider ces données : un dossier
 * déclaré « à compléter » rouvre quelques champs, et le bordereau des frais
 * généraux arrive plus tard par un autre formulaire. Recopier les règles dans
 * chacun aurait laissé la porte ouverte à ce qu'elles divergent — le nom
 * refusant les chiffres ici mais pas là.
 *
 * Elles sont donc écrites une fois, pour la demande la plus large, et chaque
 * requête ne retient que les clés qui la concernent. `Application::FIELDS` et
 * `Application::DOCUMENTS` disent lesquelles ; le reste est refusé, jamais
 * ignoré.
 */
trait ValidatesApplicationFields
{
    /**
     * Un nom de personne : des lettres, et rien d'autre que ce qui sépare deux
     * mots d'un nom — espace, trait d'union, apostrophe. Ni chiffre, ni
     * ponctuation, ni symbole. `\p{L}` couvre les lettres accentuées et
     * `\p{M}` les signes diacritiques composés, sans quoi « Ranaivosoa » passe
     * mais « Ravão » échoue selon la façon dont le clavier a produit le « ã ».
     */
    private const NAME_PATTERN = "/^\p{L}[\p{L}\p{M}\s'’\-]*$/u";

    /**
     * Table complète des règles, une entrée par champ déclarable.
     *
     * Trois valeurs suffisent à la nuancer : le type de demande décide de ce
     * qui est demandé, la situation matrimoniale ouvre ou ferme la CIN du
     * conjoint, et la religion « autre » exige sa précision. Elles sont passées
     * plutôt que lues sur la requête, parce qu'à la complétion elles viennent
     * du dossier déjà enregistré et non du formulaire.
     *
     * @return array<string, array<int, mixed>>
     */
    protected function applicationFieldRules(
        ?string $type,
        ?string $maritalStatus,
        ?string $religion
    ): array {
        $isReinscription = $type === Application::TYPE_REINSCRIPTION;
        $isMarried = $maritalStatus === Application::MARITAL_MARRIED;
        $isOtherReligion = $religion === Application::RELIGION_OTHER;
        $cin = 'regex:/^\d{' . Application::CIN_LENGTH . '}$/';

        return [
            // — Informations personnelles —
            'last_name' => ['required', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'first_name' => ['required', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'gender' => ['required', Rule::in(array_keys(Application::GENDERS))],
            'nationality' => ['required', 'string', 'max:120'],
            'birth_date' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'birth_place' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:50', 'regex:/^[0-9+\s().-]{8,}$/'],
            'email' => ['required', 'string', 'email:rfc', 'max:255'],
            'marital_status' => ['required', Rule::in(array_keys(Application::MARITAL_STATUSES))],
            'religion' => ['required', Rule::in(array_keys(Application::RELIGIONS))],
            'religion_other' => [$isOtherReligion ? 'required' : 'nullable', 'string', 'max:120'],

            // — Carte d'identité nationale —
            'cin_number' => ['required', 'string', $cin],
            'cin_issued_place' => ['required', 'string', 'max:255'],
            'cin_issued_at' => ['required', 'date', 'before_or_equal:today', 'after:1900-01-01'],
            'cin_duplicate_at' => ['nullable', 'date', 'before_or_equal:today', 'after_or_equal:cin_issued_at'],

            /* La CIN du conjoint n'a de sens que pour un candidat marié : elle
               est exigée dans ce cas, et refusée hors de ce cas plutôt que
               conservée en base sans raison. */
            'spouse_cin_number' => $isMarried
                ? ['required', 'string', $cin]
                : ['nullable', 'prohibited'],

            // — Baccalauréat —
            'bac_year' => ['required', 'integer', 'min:1960', 'max:' . (now()->year + 1)],
            'bac_series' => ['required', Rule::in(Application::BAC_SERIES)],
            // Le numéro du baccalauréat est une suite de chiffres : « string »
            // conservé pour que les zéros de tête survivent, la forme étant
            // imposée par l'expression régulière.
            'bac_number' => ['required', 'string', 'max:30', 'regex:/^\d+$/'],
            'bac_mention' => ['required', Rule::in(array_keys(Application::BAC_MENTIONS))],

            // — Inscription demandée —
            'level' => ['required', Rule::in(StudentFile::LEVELS)],
            'mention' => ['required', 'string', Rule::exists(Department::class, 'slug')->where('is_visible', true)],

            // Propre à la réinscription : seule pièce d'identification qu'elle
            // demande, et la seule à y être obligatoire.
            'student_number' => [$isReinscription ? 'required' : 'nullable', 'string', 'max:60'],
            'previous_level' => ['nullable', Rule::in(StudentFile::LEVELS)],

            /* — Parents —
               Les colonnes restent `parent1_*` / `parent2_*` : elles portent
               des dossiers déjà déposés, et les renommer pour un intitulé
               n'apprendrait rien à personne. Seuls les libellés disent
               désormais « père » et « mère ». */
            'parent1_name' => ['required', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'parent1_phone' => ['required', 'string', 'max:50', 'regex:/^[0-9+\s().-]{8,}$/'],
            'parent2_name' => ['nullable', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'parent2_phone' => ['nullable', 'string', 'max:50', 'regex:/^[0-9+\s().-]{8,}$/'],
        ];
    }

    /**
     * Règle d'une pièce jointe.
     *
     * Le contrôle porte sur l'extension **et** sur le type MIME déduit du
     * contenu (`mimes` s'appuie sur le fichier, pas sur l'en-tête annoncé par
     * le client) : un exécutable renommé en `.pdf` est refusé.
     *
     * @return array<int, string>
     */
    protected function applicationDocumentRule(string $type, bool $required): array
    {
        return [
            $required ? 'required' : 'nullable',
            'file',
            'mimes:' . implode(',', Application::documentExtensions($type)),
            'max:' . Application::DOCUMENT_MAX_KB,
        ];
    }

    /** Libellés français des champs, repris dans tous les messages d'erreur. */
    protected function applicationAttributes(): array
    {
        return [
            'type' => 'type de demande',
            'last_name' => 'nom',
            'first_name' => 'prénom',
            'gender' => 'sexe',
            'nationality' => 'nationalité',
            'birth_date' => 'date de naissance',
            'birth_place' => 'lieu de naissance',
            'phone' => 'numéro de téléphone',
            'email' => 'adresse e-mail',
            'religion' => 'religion',
            'religion_other' => 'précision sur la religion',
            'marital_status' => 'situation matrimoniale',
            'cin_number' => 'numéro de CIN',
            'cin_issued_place' => 'lieu de délivrance de la CIN',
            'cin_issued_at' => 'date de délivrance de la CIN',
            'cin_duplicate_at' => 'date du duplicata de la CIN',
            'spouse_cin_number' => 'numéro de CIN du conjoint',
            'bac_year' => 'année d\'obtention du baccalauréat',
            'bac_series' => 'série du baccalauréat',
            'bac_number' => 'numéro du baccalauréat',
            'bac_mention' => 'mention du baccalauréat',
            'level' => 'niveau',
            'mention' => 'mention',
            'student_number' => 'numéro matricule',
            'previous_level' => 'niveau précédent',
            'parent1_name' => 'nom du père',
            'parent1_phone' => 'téléphone du père',
            'parent2_name' => 'nom de la mère',
            'parent2_phone' => 'téléphone de la mère',

            /* Écrits à la main plutôt que dérivés des libellés : « CIN » y
               garde ses capitales, qu'une mise en minuscules automatique
               emporterait. */
            'documents.bac_transcript' => 'relevé de notes du baccalauréat',
            'documents.cin' => 'photocopie de la CIN',
            'documents.report_card' => 'photocopie du bulletin de notes',
            'documents.photo' => 'photo d\'identité en buste',
            'documents.payment_receipt' => 'bordereau de versement',
            'documents.general_fees_receipt' => 'bordereau de versement des frais généraux',
        ];
    }

    /**
     * Messages écrits pour un candidat, pas pour un développeur : ils disent
     * quoi corriger, jamais ce que la règle s'appelle.
     */
    protected function applicationMessages(): array
    {
        $extensions = strtoupper(implode(', ', Application::DOCUMENT_EXTENSIONS));
        $maxMb = round(Application::DOCUMENT_MAX_KB / 1024);

        return [
            'required' => 'Le champ « :attribute » est obligatoire.',
            'prohibited' => 'Le champ « :attribute » n\'est pas demandé pour ce type de demande.',
            'email.email' => 'Indiquez une adresse e-mail valide : l\'accusé de réception y sera envoyé.',
            'phone.regex' => 'Indiquez un numéro de téléphone valide (au moins 8 chiffres).',
            'parent1_phone.regex' => 'Indiquez un numéro de téléphone valide pour le père.',
            'parent2_phone.regex' => 'Indiquez un numéro de téléphone valide pour la mère.',
            'birth_date.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'last_name.regex' => 'Le nom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'first_name.regex' => 'Le prénom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'parent1_name.regex' => 'Le nom du père ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'parent2_name.regex' => 'Le nom de la mère ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'bac_number.regex' => 'Le numéro du baccalauréat ne doit contenir que des chiffres.',
            'cin_number.regex' => 'Le numéro de CIN doit comporter exactement ' . Application::CIN_LENGTH . ' chiffres.',
            'spouse_cin_number.regex' => 'Le numéro de CIN du conjoint doit comporter exactement ' . Application::CIN_LENGTH . ' chiffres.',
            'spouse_cin_number.required' => 'Le numéro de CIN du conjoint est obligatoire pour un candidat marié.',
            'spouse_cin_number.prohibited' => 'Le numéro de CIN du conjoint ne se renseigne que pour un candidat marié.',
            'cin_issued_at.before_or_equal' => 'La date de délivrance de la CIN ne peut pas être dans le futur.',
            'cin_duplicate_at.before_or_equal' => 'La date du duplicata ne peut pas être dans le futur.',
            'cin_duplicate_at.after_or_equal' => 'Le duplicata ne peut pas précéder la délivrance de la CIN.',
            'religion_other.required' => 'Précisez votre religion.',
            'mention.exists' => 'Choisissez une mention proposée par l\'établissement.',
            'student_number.required' => 'Le numéro matricule est obligatoire pour une réinscription.',
            'documents.*.mimes' => 'Formats acceptés : ' . $extensions . '.',
            'documents.photo.mimes' => 'La photo doit être une image : '
                . strtoupper(implode(', ', Application::documentExtensions('photo'))) . '.',
            'documents.*.prohibited' => 'Cette pièce n\'est pas demandée pour ce type de demande.',
            'documents.*.max' => 'Le fichier dépasse la taille maximale de ' . $maxMb . ' Mo.',
            'documents.*.file' => 'Le fichier n\'a pas pu être lu. Réessayez avec un autre fichier.',
            'documents.*.required' => 'La pièce « :attribute » est obligatoire.',
        ];
    }
}
