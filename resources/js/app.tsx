import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import '../css/app.css';
import './bootstrap';
import './i18n';

/* Nom du site, repris dans l'onglet du navigateur et dans les résultats de
   recherche. Il vient de `VITE_APP_NAME`, donc de `APP_NAME` : changer le nom
   se fait dans le `.env` du serveur, pas ici. */
const appName = import.meta.env.VITE_APP_NAME || 'ASJA';

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
