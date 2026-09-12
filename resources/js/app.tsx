import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import './bootstrap';
import './i18n';

/* Suffixe de l'onglet du navigateur. Il double celui que le serveur compose
   dans la vue racine (App\Support\Seo) : les deux doivent dire la même chose,
   sans quoi le titre changerait au montage de React. Voir `config/seo.php`,
   clé `site_name`. */
const appName = 'Université ASJA';

createInertiaApp({
    /* Une page sans titre propre garde celui posé par la vue racine : la
       rejoindre par « — ASJA » afficherait « — ASJA » tout court. */
    title: (title) => (title ? `${title} — ${appName}` : appName),
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#2f9e5f',
    },
});
