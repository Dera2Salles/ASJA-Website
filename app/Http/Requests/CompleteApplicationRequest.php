<?php

namespace App\Http\Requests;

use App\Http\Requests\Concerns\ValidatesApplicationFields;
use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Renvoi d'un dossier déclaré « à compléter ».
 *
 * Compléter n'est pas redéposer. Le candidat ne revoit que ce que
 * l'administration a réclamé — quelques pièces, quelques champs — et **tout le
 * reste est refusé**, pas seulement ignoré : un dossier en cours d'instruction
 * ne doit pas pouvoir voir son état civil réécrit à la faveur d'un formulaire
 * rouvert pour une photocopie illisible.
 *
 * La liste des éléments rouverts vient du dossier lui-même, jamais de la
 * requête : c'est l'administration qui décide de ce qui est corrigeable, et le
 * navigateur n'a pas voix au chapitre.
 */
class CompleteApplicationRequest extends FormRequest
{
    use ValidatesApplicationFields;

    /**
     * L'accès au dossier est déjà tranché par le contrôleur — numéro de
     * demande *et* adresse e-mail, puis droit conservé en session. Reste ici la
     * seule question qui porte sur le contenu : le dossier attend-il vraiment
     * un complément ?
     */
    public function authorize(): bool
    {
        return $this->application()->awaitsCompletion();
    }

    public function rules(): array
    {
        $application = $this->application();
        $requestedFields = $application->requestedFieldNames();

        /* Le contexte des règles vient du dossier, complété par la requête
           pour les seuls champs rouverts : une situation matrimoniale qui n'est
           pas à corriger reste celle du dossier, et c'est elle qui décide si la
           CIN du conjoint est attendue. */
        $context = fn (string $field) => in_array($field, $requestedFields, true)
            ? $this->input($field)
            : $application->{$field};

        $rules = $this->applicationFieldRules(
            $application->type,
            $context('marital_status'),
            $context('religion'),
        );

        foreach ($rules as $field => $rule) {
            if (! in_array($field, $requestedFields, true)) {
                $rules[$field] = ['nullable', 'prohibited'];
            }
        }

        return [...$rules, ...$this->documentRules($application)];
    }

    /**
     * Les pièces réclamées, et elles seules.
     *
     * Elles sont toutes obligatoires : si l'administration en a demandé une,
     * renvoyer le formulaire sans elle ne fait pas avancer le dossier. Les
     * autres sont refusées — redéposer une pièce que personne n'a contestée
     * remplacerait sans raison un fichier déjà vérifié.
     */
    private function documentRules(Application $application): array
    {
        $requested = $application->requestedDocumentTypes();
        $rules = [];

        foreach (array_keys(Application::DOCUMENTS) as $type) {
            $rules['documents.' . $type] = in_array($type, $requested, true)
                ? $this->applicationDocumentRule($type, true)
                : ['nullable', 'prohibited'];
        }

        return $rules;
    }

    public function attributes(): array
    {
        return $this->applicationAttributes();
    }

    public function messages(): array
    {
        return [
            ...$this->applicationMessages(),
            'prohibited' => 'Le champ « :attribute » n\'est pas ouvert à la correction sur ce dossier.',
            'documents.*.prohibited' => 'Cette pièce n\'a pas été réclamée : elle ne peut pas être remplacée ici.',
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'email' => is_string($this->input('email'))
                ? strtolower(trim($this->input('email')))
                : null,
        ], fn ($value) => $value !== null));
    }

    private function application(): Application
    {
        return $this->route('application');
    }
}
