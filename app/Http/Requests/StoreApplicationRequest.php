<?php

namespace App\Http\Requests;

use App\Models\Application;
use App\Models\Department;
use App\Support\StudentFile;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Validation serveur du dépôt de candidature.
 *
 * Le formulaire valide déjà chaque étape dans le navigateur, mais rien de ce
 * qui arrive ici n'est tenu pour acquis : la requête peut être forgée. C'est
 * cette classe qui fait foi, et le front n'en est que le reflet.
 */
class StoreApplicationRequest extends FormRequest
{
    /** Le dépôt est ouvert à tous : un candidat n'a pas encore de compte. */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Un nom de personne : des lettres, et rien d'autre que ce qui sépare deux
     * mots d'un nom — espace, trait d'union, apostrophe. Ni chiffre, ni
     * ponctuation, ni symbole. `\p{L}` couvre les lettres accentuées et
     * `\p{M}` les signes diacritiques composés, sans quoi « Ranaivosoa » passe
     * mais « Ravão » échoue selon la façon dont le clavier a produit le « ã ».
     */
    private const NAME_PATTERN = "/^\p{L}[\p{L}\p{M}\s'’\-]*$/u";

    public function rules(): array
    {
        return [
            'type' => ['required', Rule::in(array_keys(Application::TYPES))],

            /* Le jeton d'idempotence est engendré une fois par formulaire :
               il rend le dépôt rejouable sans créer de doublon. */
            'idempotency_key' => ['required', 'string', 'size:36'],

            ...$this->declaredRules(),
            ...$this->documentRules(),
        ];
    }

    /**
     * Une règle par champ déclaré, filtrée par le type de demande.
     *
     * Les règles sont écrites une fois, pour la demande la plus large — la
     * première inscription. `Application::FIELDS` dit ensuite lesquelles ont
     * cours : une réinscription ne déclare que son matricule et son adresse
     * e-mail, et tout le reste y est **refusé** plutôt qu'ignoré. Écrire
     * `prohibited` là où le formulaire ne demande rien ferme la porte à la
     * requête forgée qui réécrirait l'état civil d'un étudiant déjà au
     * dossier.
     *
     * `prohibited` laisse passer une valeur vide : le formulaire n'envoie que
     * les champs de son type, mais un navigateur qui posterait une chaîne vide
     * n'est pas fautif pour autant.
     */
    private function declaredRules(): array
    {
        $isReinscription = $this->input('type') === Application::TYPE_REINSCRIPTION;
        $isMarried = $this->input('marital_status') === Application::MARITAL_MARRIED;
        $isOtherReligion = $this->input('religion') === Application::RELIGION_OTHER;
        $cin = 'regex:/^\d{' . Application::CIN_LENGTH . '}$/';

        $rules = [
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

            // — Parents —
            'parent1_name' => ['required', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'parent1_phone' => ['required', 'string', 'max:50', 'regex:/^[0-9+\s().-]{8,}$/'],
            'parent2_name' => ['nullable', 'string', 'max:255', 'regex:' . self::NAME_PATTERN],
            'parent2_phone' => ['nullable', 'string', 'max:50', 'regex:/^[0-9+\s().-]{8,}$/'],
        ];

        foreach ($rules as $field => $rule) {
            if (! Application::fieldApplies($field, $this->input('type'))) {
                $rules[$field] = ['nullable', 'prohibited'];
            }
        }

        return $rules;
    }

    /**
     * Une règle par pièce.
     *
     * Trois cas : exigée, proposée, ou hors sujet pour ce type de demande —
     * auquel cas elle est refusée plutôt qu'enregistrée. Une réinscription n'a
     * pas à déposer un relevé de baccalauréat déjà archivé, et le formulaire ne
     * le lui propose pas ; une requête forgée ne doit pas contourner cela.
     *
     * Le contrôle porte sur l'extension **et** sur le type MIME déduit du
     * contenu (`mimes` s'appuie sur le fichier, pas sur l'en-tête annoncé par
     * le client) : un exécutable renommé en `.pdf` est refusé.
     */
    private function documentRules(): array
    {
        $rules = [];
        $type = $this->input('type');

        foreach (array_keys(Application::DOCUMENTS) as $name) {
            $key = 'documents.' . $name;

            if (! Application::documentApplies($name, $type)) {
                $rules[$key] = ['nullable', 'prohibited'];

                continue;
            }

            $required = in_array($name, Application::requiredDocuments($type), true);

            $rules[$key] = [
                $required ? 'required' : 'nullable',
                'file',
                'mimes:' . implode(',', Application::documentExtensions($name)),
                'max:' . Application::DOCUMENT_MAX_KB,
            ];
        }

        return $rules;
    }

    /**
     * Garde-fou contre le dépôt répété.
     *
     * Le jeton d'idempotence couvre le double clic et le renvoi du formulaire.
     * Reste le candidat qui recommence tout un quart d'heure plus tard en
     * croyant que rien n'est parti : une demande du même type, pour la même
     * adresse, encore en attente et déposée le même jour, suffit à le dire.
     */
    public function withValidator(Validator $validator): void
    {
        $validator->after(function (Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return;
            }

            $duplicate = Application::where('email', $this->input('email'))
                ->where('type', $this->input('type'))
                ->where('status', Application::STATUS_PENDING)
                ->where('created_at', '>=', now()->subDay())
                ->exists();

            if ($duplicate) {
                $validator->errors()->add(
                    'email',
                    'Une demande du même type a déjà été déposée avec cette adresse dans les dernières 24 heures. '
 . 'Consultez l\'accusé de réception reçu par e-mail, ou contactez le bureau de la scolarité.'
                );
            }
        });
    }

    /** Libellés français des champs, repris dans tous les messages d'erreur. */
    public function attributes(): array
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
            'parent1_name' => 'nom du premier parent',
            'parent1_phone' => 'téléphone du premier parent',
            'parent2_name' => 'nom du second parent',
            'parent2_phone' => 'téléphone du second parent',
            'documents.bac_transcript' => 'relevé de notes du baccalauréat',
            'documents.cin' => 'photocopie de la CIN',
            'documents.report_card' => 'photocopie du bulletin de notes',
            'documents.photo' => 'photo d\'identité en buste',
            'documents.payment_receipt' => 'bordereau de versement',
        ];
    }

    /**
     * Messages écrits pour un candidat, pas pour un développeur : ils disent
     * quoi corriger, jamais ce que la règle s'appelle.
     */
    public function messages(): array
    {
        $extensions = strtoupper(implode(', ', Application::DOCUMENT_EXTENSIONS));
        $maxMb = round(Application::DOCUMENT_MAX_KB / 1024);

        return [
            'required' => 'Le champ « :attribute » est obligatoire.',
            'prohibited' => 'Le champ « :attribute » n\'est pas demandé pour ce type de demande.',
            'email.email' => 'Indiquez une adresse e-mail valide : l\'accusé de réception y sera envoyé.',
            'phone.regex' => 'Indiquez un numéro de téléphone valide (au moins 8 chiffres).',
            'parent1_phone.regex' => 'Indiquez un numéro de téléphone valide pour le premier parent.',
            'parent2_phone.regex' => 'Indiquez un numéro de téléphone valide pour le second parent.',
            'birth_date.before' => 'La date de naissance doit être antérieure à aujourd\'hui.',
            'last_name.regex' => 'Le nom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'first_name.regex' => 'Le prénom ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'parent1_name.regex' => 'Le nom du premier parent ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
            'parent2_name.regex' => 'Le nom du second parent ne doit contenir que des lettres, sans chiffre ni caractère spécial.',
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

    /** Normalisation avant validation : l'adresse sert de clé, elle est unifiée. */
    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'email' => is_string($this->input('email'))
                ? strtolower(trim($this->input('email')))
                : null,
        ], fn ($value) => $value !== null));
    }
}
