<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesApplicationFields;
use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

/**
 * Validation serveur du dépôt de candidature.
 *
 * Le formulaire valide déjà chaque étape dans le navigateur, mais rien de ce
 * qui arrive ici n'est tenu pour acquis : la requête peut être forgée. C'est
 * cette classe qui fait foi, et le front n'en est que le reflet.
 *
 * Les règles elles-mêmes vivent dans `ValidatesApplicationFields`, partagé avec
 * le parcours de complétion : un champ ne doit pas être plus permissif parce
 * qu'il est corrigé après coup plutôt que saisi au dépôt.
 */
class StoreApplicationRequest extends FormRequest
{
    use ValidatesApplicationFields;

    /** Le dépôt est ouvert à tous : un candidat n'a pas encore de compte. */
    public function authorize(): bool
    {
        return true;
    }

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
        $rules = $this->applicationFieldRules(
            $this->input('type'),
            $this->input('marital_status'),
            $this->input('religion'),
        );

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
     * Trois cas : exigée, proposée, ou hors sujet pour ce dépôt — auquel cas
     * elle est refusée plutôt qu'enregistrée. Une réinscription n'a pas à
     * déposer un relevé de baccalauréat déjà archivé, et le formulaire ne le
     * lui propose pas ; une requête forgée ne doit pas contourner cela.
     *
     * L'étape compte autant que le type : le bordereau des frais généraux
     * concerne bien une première inscription, mais il n'est dû qu'après
     * validation du dossier. Le déposer ici reviendrait à faire verser
     * 210 000 Ar pour une candidature qui peut encore être refusée — il est
     * donc refusé à ce formulaire comme s'il n'existait pas.
     */
    private function documentRules(): array
    {
        $rules = [];
        $type = $this->input('type');
        $required = Application::requiredDocuments($type);

        foreach (array_keys(Application::DOCUMENTS) as $name) {
            $key = 'documents.' . $name;

            if (! Application::documentApplies($name, $type)) {
                $rules[$key] = ['nullable', 'prohibited'];

                continue;
            }

            $rules[$key] = $this->applicationDocumentRule(
                $name,
                in_array($name, $required, true)
            );
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

    public function attributes(): array
    {
        return $this->applicationAttributes();
    }

    public function messages(): array
    {
        return $this->applicationMessages();
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
