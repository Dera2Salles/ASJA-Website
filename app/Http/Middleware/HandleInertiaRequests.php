<?php

namespace App\Http\Middleware;

use App\Support\Cms;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
            ],

            /* Sommaire des sections éditables, partagé pour que la barre
               latérale de l'administration le déroule depuis n'importe quelle
               page. Seuls les intitulés circulent, et seulement une fois
               connecté : les pages publiques n'en ont aucun usage.

               Le nom `cms` est déjà pris par la page d'accueil, qui y place le
               contenu résolu du site : d'où cette clé distincte, pour que les
               deux ne se recouvrent jamais. */
            'cmsSections' => $request->user()
                ? Cms::sections()
                : (object) [],
        ];
    }
}
