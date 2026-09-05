<?php

namespace App\Console\Commands;

use App\Support\Cms;
use App\Support\Uploads;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

/**
 * Reprise des fichiers déjà stockés sur le disque `public` de Laravel.
 *
 * Les téléversements passent désormais par `public/uploads` (voir
 * App\Support\Uploads), servi directement par le serveur web. Les contenus
 * créés avant ce changement pointent encore vers `storage/app/public` via le
 * lien symbolique `public/storage`, absent d'un hébergement cPanel : cette
 * commande recopie les fichiers et réécrit les chemins en base.
 *
 * Elle est sans effet si elle est relancée : un chemin déjà en `/uploads/...`
 * n'est plus reconnu comme hérité.
 */
class MigrateUploadsCommand extends Command
{
    protected $signature = 'uploads:migrate {--dry-run : Affiche les changements sans rien écrire}';

    protected $description = 'Déplace les fichiers du disque public vers public/uploads et réécrit les chemins en base.';

    /** Colonnes portant un chemin de fichier : table => colonnes. */
    private const COLUMNS = [
        'posts' => ['cover_image'],
        'testimonies' => ['avatar'],
        'departments' => ['logo', 'hero_image'],
    ];

    private bool $dryRun = false;

    public function handle(): int
    {
        $this->dryRun = (bool) $this->option('dry-run');

        if ($this->dryRun) {
            $this->comment('Simulation : aucun fichier ni aucune ligne ne sera modifié.');
        }

        $this->moveFiles();
        $this->rewriteColumns();
        $this->rewriteComponentData();

        $this->info('Reprise terminée.');

        return self::SUCCESS;
    }

    /** Recopie `storage/app/public/**` vers `public/uploads/**`, arborescence comprise. */
    private function moveFiles(): void
    {
        $source = storage_path('app/public');

        if (! is_dir($source)) {
            return;
        }

        foreach (File::allFiles($source) as $file) {
            $relative = str_replace('\\', '/', $file->getRelativePathname());

            // `.gitignore` et consorts ne sont pas du contenu.
            if (Str::startsWith($file->getFilename(), '.')) {
                continue;
            }

            $target = Uploads::path($relative);

            if (file_exists($target)) {
                continue;
            }

            $this->line("  fichier  {$relative}");

            if (! $this->dryRun) {
                File::ensureDirectoryExists(dirname($target));
                File::copy($file->getPathname(), $target);
            }
        }
    }

    private function rewriteColumns(): void
    {
        foreach (self::COLUMNS as $table => $columns) {
            foreach ($columns as $column) {
                DB::table($table)
                    ->whereNotNull($column)
                    ->where($column, '<>', '')
                    ->orderBy('id')
                    ->each(function (object $row) use ($table, $column) {
                        $migrated = $this->migratedPath($row->{$column});

                        if ($migrated === null) {
                            return;
                        }

                        $this->line("  {$table}#{$row->id} {$column}  {$row->{$column}} → {$migrated}");

                        if (! $this->dryRun) {
                            DB::table($table)->where('id', $row->id)->update([$column => $migrated]);
                        }
                    });
            }
        }
    }

    /**
     * Le contenu éditable stocke toutes ses valeurs dans une même colonne : le
     * schéma (config/cms.php) est la seule source qui dise lesquelles sont des
     * images. Un champ `image` porte un chemin en clair, une `list` porte du
     * JSON dont seuls les sous-champs `image` sont concernés.
     */
    private function rewriteComponentData(): void
    {
        DB::table('component_data')
            ->whereNotNull('value')
            ->where('value', '<>', '')
            ->orderBy('id')
            ->each(function (object $row) {
                $field = Cms::sectionSchema($row->section)['fields'][$row->key] ?? null;
                $type = $field['type'] ?? null;

                $updated = match ($type) {
                    'image' => $this->migratedPath($row->value) ?? $row->value,
                    'list' => $this->migratedList($row->value, $field['fields'] ?? []),
                    default => $row->value,
                };

                if ($updated === $row->value) {
                    return;
                }

                $this->line("  component_data#{$row->id} {$row->section}.{$row->key}");

                if (! $this->dryRun) {
                    DB::table('component_data')->where('id', $row->id)->update(['value' => $updated]);
                }
            });
    }

    /** Réécrit les sous-champs `image` des éléments d'une liste répétable. */
    private function migratedList(string $value, array $fields): string
    {
        $items = json_decode($value, true);

        if (! is_array($items)) {
            return $value;
        }

        $imageKeys = array_keys(array_filter(
            $fields,
            fn (array $field) => ($field['type'] ?? null) === 'image'
        ));

        if ($imageKeys === []) {
            return $value;
        }

        foreach ($items as $index => $item) {
            foreach ($imageKeys as $key) {
                if (! is_array($item) || ! isset($item[$key]) || ! is_string($item[$key])) {
                    continue;
                }

                $migrated = $this->migratedPath($item[$key]);

                if ($migrated !== null) {
                    $items[$index][$key] = $migrated;
                }
            }
        }

        // Même encodage que App\Support\Cms::put, pour ne pas réécrire les
        // accents de tout le contenu au passage.
        return json_encode(array_values($items), JSON_UNESCAPED_UNICODE);
    }

    /**
     * Chemin repris d'une valeur héritée, ou `null` si elle n'a rien à voir avec
     * l'ancien disque `public` (déjà migrée, URL externe, image livrée avec le
     * site).
     */
    private function migratedPath(?string $value): ?string
    {
        $value = is_string($value) ? trim($value) : '';

        if ($value === '' || Str::startsWith($value, ['/', 'http://', 'https://', '//'])) {
            return null;
        }

        return '/' . Uploads::DIRECTORY . '/' . ltrim($value, '/');
    }
}
