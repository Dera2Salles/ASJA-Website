<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

/**
 * Remet à jour les noms de fichiers d'assets dans `app.prod.blade.php`.
 *
 * La vue de production référence les fichiers du build par leur nom définitif,
 * empreinte comprise (`app-JYPvbu6P.js`). Cette empreinte change à chaque
 * `npm run build` : sans reprise, la vue pointe vers des fichiers disparus et
 * le site se charge à blanc. La commande relit `public/build/manifest.json`,
 * seule source de vérité sur le dernier build, et réécrit les deux lignes.
 */
class BuildProdViewCommand extends Command
{
    protected $signature = 'build:prod-view {--check : Vérifie sans écrire, échoue si la vue est périmée}';

    protected $description = 'Synchronise resources/views/app.prod.blade.php avec le dernier build Vite.';

    /** Point d'entrée Vite, tel que déclaré dans vite.config.js. */
    private const ENTRY = 'resources/js/app.tsx';

    public function handle(): int
    {
        $manifestPath = public_path('build/manifest.json');

        if (! is_file($manifestPath)) {
            $this->error('public/build/manifest.json est absent. Lancez `npm run build` d\'abord.');

            return self::FAILURE;
        }

        $entry = json_decode(File::get($manifestPath), true)[self::ENTRY] ?? null;

        if (! isset($entry['file'], $entry['css'][0])) {
            $this->error('Le manifeste ne décrit pas ' . self::ENTRY . ' avec son CSS.');

            return self::FAILURE;
        }

        $viewPath = resource_path('views/app.prod.blade.php');

        if (! is_file($viewPath)) {
            $this->error('resources/views/app.prod.blade.php est absent.');

            return self::FAILURE;
        }

        $view = File::get($viewPath);

        // Les deux lignes sont repérées par leur extension, pas par l'empreinte
        // en place : la commande reste opérante quel que soit l'état de la vue.
        $updated = preg_replace(
            ['#build/assets/app-[^\'"]+\.css#', '#build/assets/app-[^\'"]+\.js#'],
            ['build/' . $entry['css'][0], 'build/' . $entry['file']],
            $view,
            -1,
            $count
        );

        if ($count !== 2) {
            $this->error("Attendu 2 références d'assets dans la vue, {$count} trouvée(s).");

            return self::FAILURE;
        }

        if ($updated === $view) {
            $this->info('app.prod.blade.php est déjà à jour.');

            return self::SUCCESS;
        }

        if ($this->option('check')) {
            $this->error('app.prod.blade.php est périmée. Lancez `php artisan build:prod-view`.');

            return self::FAILURE;
        }

        File::put($viewPath, $updated);

        $this->info('app.prod.blade.php mise à jour :');
        $this->line('  css  build/' . $entry['css'][0]);
        $this->line('  js   build/' . $entry['file']);

        return self::SUCCESS;
    }
}
