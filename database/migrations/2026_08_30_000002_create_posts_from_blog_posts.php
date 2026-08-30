<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Unifie articles, annonces et événements dans une seule table `posts`.
 *
 * `blog_posts` ne portait que des articles ; le site a besoin de publier aussi
 * des annonces et des événements datés, avec programmation et épinglage.
 */
return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('blog_posts') && ! Schema::hasTable('posts')) {
            Schema::rename('blog_posts', 'posts');
        }

        Schema::table('posts', function (Blueprint $table) {
            $table->string('type')->default('article')->after('user_id');
            $table->text('excerpt')->nullable()->after('slug');
            $table->timestamp('event_start_at')->nullable()->after('published_at');
            $table->timestamp('event_end_at')->nullable()->after('event_start_at');
            $table->string('location')->nullable()->after('event_end_at');
            $table->boolean('is_pinned')->default(false)->after('is_published');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->index(['type', 'is_published', 'published_at']);
        });

        // Les publications déjà en base sont toutes des articles.
        DB::table('posts')->whereNull('type')->update(['type' => 'article']);
    }

    public function down(): void
    {
        Schema::table('posts', function (Blueprint $table) {
            $table->dropIndex(['type', 'is_published', 'published_at']);
            $table->dropColumn([
                'type', 'excerpt', 'event_start_at',
                'event_end_at', 'location', 'is_pinned',
            ]);
        });

        if (Schema::hasTable('posts') && ! Schema::hasTable('blog_posts')) {
            Schema::rename('posts', 'blog_posts');
        }
    }
};
