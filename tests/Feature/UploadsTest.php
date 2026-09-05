<?php

namespace Tests\Feature;

use App\Models\Post;
use App\Models\Testimony;
use App\Models\User;
use App\Support\Uploads;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

/**
 * Les fichiers téléversés sont écrits dans `uploads/`, à la racine du dépôt —
 * qui est aussi la racine web en production, le dépôt étant déployé tel quel
 * dans `public_html`. C'est la seule forme qui fonctionne sur cet hébergement,
 * où le lien symbolique `public/storage` ne peut pas être garanti. La base ne
 * stocke donc plus une clé de disque mais le chemin web définitif.
 */
class UploadsTest extends TestCase
{
    use RefreshDatabase;

    /** @var list<string> Chemins web créés par le test, nettoyés après coup. */
    private array $created = [];

    protected function tearDown(): void
    {
        foreach ($this->created as $path) {
            Uploads::delete($path);
        }

        parent::tearDown();
    }

    private function admin(): User
    {
        return User::factory()->create(['role' => 'Admin']);
    }

    private function image(string $name = 'photo.jpg'): UploadedFile
    {
        return UploadedFile::fake()->create($name, 16, 'image/jpeg');
    }

    private function track(?string $path): string
    {
        $this->assertNotNull($path);
        $this->created[] = $path;

        return $path;
    }

    public function test_une_publication_enregistre_le_chemin_web_du_fichier(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/publications', [
                'type' => Post::TYPE_ARTICLE,
                'title' => 'Rentrée universitaire',
                'content' => 'Contenu.',
                'cover_image' => $this->image(),
                'is_published' => true,
            ])
            ->assertRedirect('/admin/publications');

        $cover = $this->track(Post::sole()->cover_image);

        $this->assertStringStartsWith('/uploads/posts/', $cover);
        $this->assertFileExists(base_path(ltrim($cover, '/')));
    }

    public function test_le_nom_de_fichier_du_client_nest_pas_reutilise(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/publications', [
                'type' => Post::TYPE_ARTICLE,
                'title' => 'Nom hostile',
                'content' => 'Contenu.',
                'cover_image' => $this->image('../../evil.jpg'),
                'is_published' => true,
            ]);

        $cover = $this->track(Post::sole()->cover_image);

        $this->assertStringNotContainsString('evil', $cover);
        $this->assertStringNotContainsString('..', $cover);
    }

    public function test_remplacer_une_image_supprime_la_precedente(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/admin/publications', [
            'type' => Post::TYPE_ARTICLE,
            'title' => 'Avant',
            'content' => 'Contenu.',
            'cover_image' => $this->image(),
            'is_published' => true,
        ]);

        $post = Post::sole();
        $ancien = $this->track($post->cover_image);

        $this->actingAs($admin)->put("/admin/publications/{$post->id}", [
            'type' => Post::TYPE_ARTICLE,
            'title' => 'Après',
            'content' => 'Contenu.',
            'cover_image' => $this->image(),
            'is_published' => true,
        ]);

        $nouveau = $this->track($post->fresh()->cover_image);

        $this->assertNotSame($ancien, $nouveau);
        $this->assertFileDoesNotExist(base_path(ltrim($ancien, '/')));
        $this->assertFileExists(base_path(ltrim($nouveau, '/')));
    }

    public function test_supprimer_une_publication_supprime_son_image(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin)->post('/admin/publications', [
            'type' => Post::TYPE_ARTICLE,
            'title' => 'À supprimer',
            'content' => 'Contenu.',
            'cover_image' => $this->image(),
            'is_published' => true,
        ]);

        $post = Post::sole();
        $cover = $this->track($post->cover_image);

        $this->actingAs($admin)->delete("/admin/publications/{$post->id}");

        $this->assertFileDoesNotExist(base_path(ltrim($cover, '/')));
    }

    public function test_limage_de_contenu_renvoie_un_chemin_directement_affichable(): void
    {
        $response = $this->actingAs($this->admin())
            ->post('/admin/contenu/image', ['image' => $this->image()])
            ->assertOk();

        $path = $this->track($response->json('path'));

        $this->assertStringStartsWith('/uploads/cms/', $path);
        $this->assertFileExists(base_path(ltrim($path, '/')));
    }

    public function test_un_temoignage_stocke_son_avatar_dans_uploads(): void
    {
        $this->actingAs($this->admin())
            ->post('/admin/testimonies', [
                'name' => 'Hery',
                'content' => 'Merci.',
                'avatar' => $this->image(),
                'is_visible' => true,
            ])
            ->assertRedirect('/admin/testimonies');

        $avatar = $this->track(Testimony::sole()->avatar);

        $this->assertStringStartsWith('/uploads/testimonies/', $avatar);
        $this->assertFileExists(base_path(ltrim($avatar, '/')));
    }

    /**
     * En développement la racine web est `public/`, où `uploads/` n'existe pas :
     * la route de repli doit servir le fichier à la même URL qu'en production.
     */
    public function test_un_fichier_televerse_est_servi_sur_son_url(): void
    {
        $this->actingAs($this->admin())->post('/admin/publications', [
            'type' => Post::TYPE_ARTICLE,
            'title' => 'Servie',
            'content' => 'Contenu.',
            'cover_image' => $this->image(),
            'is_published' => true,
        ]);

        $cover = $this->track(Post::sole()->cover_image);

        $this->get($cover)->assertOk();
    }

    /** Une URL d'upload ne doit pas donner accès au reste du dépôt. */
    public function test_la_route_de_repli_ne_sert_que_le_dossier_uploads(): void
    {
        $this->get('/uploads/../.env')->assertNotFound();
        $this->get('/uploads/inexistant.jpg')->assertNotFound();
    }

    /**
     * La suppression ne doit jamais sortir du dossier `uploads` : ni par une
     * valeur héritée du disque `public`, ni par une remontée de chemin.
     */
    public function test_la_suppression_ne_sort_pas_du_dossier_uploads(): void
    {
        $temoin = Uploads::path('gardefou/temoin.txt');
        @mkdir(dirname($temoin), 0755, true);
        file_put_contents($temoin, 'x');

        foreach ([null, '', 'posts/ancien.jpg', '/asja-logo.png', '/uploads/../../.env'] as $valeur) {
            Uploads::delete($valeur);
        }

        Uploads::delete('/uploads/gardefou/../gardefou/temoin.txt');

        $this->assertFileExists(base_path('.env'));
        $this->assertFileDoesNotExist($temoin, 'Un chemin normalisé restant sous uploads doit rester supprimable.');

        @rmdir(dirname($temoin));
    }
}
