<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;

/**
 * Une série du baccalauréat proposée au candidat (A1, A2, C, D…).
 *
 * Le référentiel est administrable, comme les mentions : la scolarité ajoute,
 * renomme ou retire une série sans déploiement. Le `code` est la valeur
 * réellement stockée dans `applications.bac_series` ; il ne se renomme donc
 * pas à la légère, et le formulaire n'accepte que les codes actifs.
 */
class BacSeries extends Model
{
    /** Le pluriel de « series » étant « series », la table est nommée ici. */
    protected $table = 'bac_series';

    protected $fillable = ['code', 'label', 'is_active', 'sort_order'];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /** Séries ouvertes au formulaire, dans l'ordre voulu par l'administration. */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeOrdered(Builder $query): Builder
    {
        return $query->orderBy('sort_order')->orderBy('code');
    }

    /**
     * Codes acceptés à la saisie : ceux, et seulement ceux, que le formulaire
     * propose. Une série désactivée reste lisible sur les dossiers déjà
     * déposés, mais ne peut plus être choisie.
     *
     * @return array<int, string>
     */
    public static function activeCodes(): array
    {
        return static::query()->active()->ordered()->pluck('code')->all();
    }

    /**
     * Référentiel mis à la forme commune du front — `value` / `label` — que
     * partagent les niveaux, les mentions et les genres.
     *
     * @return array<int, array{value: string, label: string}>
     */
    public static function options(): array
    {
        return static::query()
            ->active()
            ->ordered()
            ->get(['code', 'label'])
            ->map(fn (self $series) => [
                'value' => $series->code,
                'label' => $series->optionLabel(),
            ])
            ->all();
    }

    /**
     * Intitulé affiché : le code seul quand il se suffit, le code suivi de son
     * explicitation sinon. Le code reste en tête dans les deux cas — c'est lui
     * que le candidat lit sur son relevé.
     */
    public function optionLabel(): string
    {
        return $this->label ? $this->code . ' — ' . $this->label : $this->code;
    }

    /** Nombre de dossiers déposés sous cette série : ce qui interdit sa suppression. */
    public function applicationsCount(): int
    {
        return Application::where('bac_series', $this->code)->count();
    }
}
