export const Modal = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="visible fixed inset-0 z-300 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-colors">
            {children}
        </div>
    );
};
