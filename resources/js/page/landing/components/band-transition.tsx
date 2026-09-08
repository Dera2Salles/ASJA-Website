export interface BandTransitionProps {
    /** Conservé pour compatibilité : le sens n'a plus d'effet visuel. */
    direction?: 'dark-to-light' | 'light-to-dark';
    className?: string;
}

/**
 * Séparateur neutre full light : un simple espace blanc qui conserve la
 * respiration verticale entre deux sections, sans aucun dégradé sombre.
 * L'API reste identique pour ne pas casser les pages qui l'utilisent.
 */
export const BandTransition = ({
    direction: _direction = 'dark-to-light',
    className = '',
}: BandTransitionProps) => {
    return (
        <div
            aria-hidden="true"
            role="presentation"
            className={`band-light w-full ${className}`}
            style={{
                height: 'clamp(24px, 4vh, 48px)',
                background: '#ffffff',
            }}
        />
    );
};
