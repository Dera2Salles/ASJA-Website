/**
 * Voile de modale. Pas de flou d'arrière-plan : la charte de
 * l'administration proscrit le glassmorphism, l'assombrissement suffit à
 * détacher le calque.
 */
export const Modal = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="fixed inset-0 z-300 flex items-center justify-center bg-black/50 p-4">
            {children}
        </div>
    );
};
