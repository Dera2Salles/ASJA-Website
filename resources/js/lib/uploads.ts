/**
 * Résolution des chemins de fichiers téléversés.
 *
 * Le serveur enregistre le chemin web définitif (`/uploads/...`), servi
 * directement depuis `public/uploads` : c'est la seule forme qui fonctionne sur
 * cPanel, où le lien symbolique `public/storage` ne peut pas être garanti. Les
 * valeurs relatives (`posts/x.jpg`) héritées de l'ancien disque `public` restent
 * reconnues, et une URL externe traverse la fonction inchangée.
 */
export function uploadUrl(
    value: unknown,
    fallback: string | undefined = undefined,
): string | undefined {
    if (typeof value !== 'string' || value.trim() === '') return fallback;

    const path = value.trim();
    if (/^(https?:)?\/\//.test(path) || path.startsWith('/')) return path;

    return `/storage/${path}`;
}
