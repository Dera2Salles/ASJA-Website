<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\BacSeries;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Référentiel des séries du baccalauréat, administré depuis la section
 * « Candidature ».
 *
 * Le code d'une série est la valeur écrite dans `applications.bac_series` : le
 * renommer réécrit donc les dossiers qui la portent, et la supprimer les
 * laisserait pointer vers un référentiel disparu. D'où les deux garde-fous de
 * cet écran — le renommage propage, la suppression d'une série utilisée est
 * refusée au profit de la désactivation.
 */
class BacSeriesController extends Controller
{
    public function index(): Response
    {
        $series = BacSeries::query()->ordered()->get();

        /* Le nombre de dossiers par série est compté en une passe : il décide
           de ce que la ligne autorise, et une requête par ligne pour cela
           serait payée à chaque affichage. */
        $usage = Application::query()
            ->whereNotNull('bac_series')
            ->selectRaw('bac_series, count(*) as total')
            ->groupBy('bac_series')
            ->pluck('total', 'bac_series');

        return Inertia::render('Admin/BacSeries/Index', [
            'series' => $series->map(fn (BacSeries $item) => [
                'id' => $item->id,
                'code' => $item->code,
                'label' => $item->label,
                'is_active' => $item->is_active,
                'sort_order' => $item->sort_order,
                'applications_count' => (int) ($usage[$item->code] ?? 0),
            ])->all(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $this->validated($request);

        /* Sans rang donné, la nouvelle série se range à la fin plutôt qu'en
           tête : l'ordre existant est un choix, il n'a pas à bouger. */
        $validated['sort_order'] ??= (int) BacSeries::max('sort_order') + 1;

        BacSeries::create($validated);

        return back()->with('success', 'Série ajoutée.');
    }

    public function update(Request $request, BacSeries $series): RedirectResponse
    {
        $validated = $this->validated($request, $series);
        $validated['sort_order'] ??= $series->sort_order;

        $previousCode = $series->code;

        $series->update($validated);

        /* Le code corrigé doit suivre sur les dossiers déjà déposés : sinon
           « OSE » renommée « OSE1 » laisse derrière elle des candidatures dont
           la série n'existe plus, invisibles au filtre comme au référentiel. */
        if ($series->code !== $previousCode) {
            Application::where('bac_series', $previousCode)
                ->update(['bac_series' => $series->code]);
        }

        return back()->with('success', 'Série mise à jour.');
    }

    /**
     * Suppression, mais seulement d'une série que personne n'a déclarée.
     *
     * Effacer une série déjà choisie par un candidat ne supprime pas la donnée
     * du dossier : elle la rend orpheline. Dans ce cas l'administration est
     * renvoyée vers la désactivation, qui retire la série du formulaire sans
     * toucher à l'historique.
     */
    public function destroy(BacSeries $series): RedirectResponse
    {
        $used = $series->applicationsCount();

        if ($used > 0) {
            return back()->withErrors([
                'code' => "Cette série est déclarée sur {$used} dossier(s) : désactivez-la plutôt que de la supprimer.",
            ]);
        }

        $series->delete();

        return back()->with('success', 'Série supprimée.');
    }

    /**
     * @return array<string, mixed>
     */
    private function validated(Request $request, ?BacSeries $current = null): array
    {
        $validated = $request->validate([
            /* Majuscules, chiffres, espaces et tirets : le code est ce qui
               est imprimé sur le relevé, et certaines séries s'y écrivent en
               toutes lettres. Sa longueur n'est plus bornée en deçà de la
               colonne qui l'accueille — les 255 caractères sont ceux du
               schéma, pas une idée que nous nous faisons des séries. */
            'code' => [
                'required', 'string', 'max:255', 'regex:/^[A-Z0-9][A-Z0-9 -]*$/',
                Rule::unique(BacSeries::class, 'code')->ignore($current),
            ],
            'label' => ['nullable', 'string', 'max:255'],
            'is_active' => ['boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0', 'max:999'],
        ], [
            'code.regex' => 'Le code d\'une série s\'écrit en majuscules, chiffres, espaces ou tirets (A1, C, OSE, TECHNIQUE INDUSTRIEL…).',
        ], [
            'code' => 'code de la série',
            'label' => 'intitulé',
            'sort_order' => 'ordre d\'affichage',
        ]);

        $validated['is_active'] = $request->boolean('is_active');
        // Un intitulé vide, ou simplement absent du formulaire, vaut « pas
        // d'intitulé » : le code s'affiche alors seul.
        $validated['label'] = ($validated['label'] ?? null) ?: null;

        return $validated;
    }
}
