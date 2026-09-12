# Les parcours de candidature sont personnels : ils s'ouvrent par lien signé,
# n'ont aucun intérêt pour un moteur de recherche, et leurs pages portent déjà
# `noindex`. La règle ci-dessous évite au robot de s'y user inutilement.
User-agent: *
Allow: /
Disallow: /admin
Disallow: /candidature/suivi
Disallow: /candidature/confirmation
Disallow: /espace-etudiant
Disallow: /profile

Sitemap: {{ route('sitemap') }}
