<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;

/**
 * Déplace les images de publication écrites par l'ancien contrôleur.
 *
 * Elles étaient enregistrées directement dans public/uploads/, alors que les
 * nouvelles passent par le disque `public` (storage/app/public, servi via
 * /storage). Sans ce déplacement, les visuels des publications déjà en base
 * ne s'afficheraient plus.
 */
return new class extends Migration
{
    public function up(): void
    {
        $posts = DB::table('posts')
            ->whereNotNull('cover_image')
            ->get(['id', 'cover_image']);

        foreach ($posts as $post) {
            $legacyPath = public_path('uploads/' . $post->cover_image);

            // Déjà sur le disque public, ou fichier absent : rien à faire.
            if (! File::exists($legacyPath)) {
                continue;
            }

            $target = 'posts/' . basename($post->cover_image);

            Storage::disk('public')->put($target, File::get($legacyPath));
            File::delete($legacyPath);

            DB::table('posts')->where('id', $post->id)->update(['cover_image' => $target]);
        }
    }

    public function down(): void
    {
        // Le déplacement de fichiers n'est pas rejoué à l'envers : les images
        // restent accessibles sur le disque public.
    }
};
