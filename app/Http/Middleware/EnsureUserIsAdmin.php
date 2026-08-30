<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Réserve l'administration aux comptes dont le rôle est « Admin ».
 *
 * Sans ce filtre, `auth` seul laissait tout étudiant connecté accéder au CMS
 * et modifier l'intégralité du contenu public.
 */
class EnsureUserIsAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        abort_unless($request->user()?->role === 'Admin', 403);

        return $next($request);
    }
}
