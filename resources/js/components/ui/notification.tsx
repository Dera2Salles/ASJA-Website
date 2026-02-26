import { Toaster } from 'sonner';

export const NotificationWithTimer = () => {
    return (
        <Toaster
            position="top-right"
            richColors
            visibleToasts={3}
            duration={3000}
            expand={true}
            theme="light"
            toastOptions={{
                classNames: {
                    toast: 'font-sans rounded-lg border',
                    title: 'font-semibold text-xl',
                    description: 'text-lg opacity-90',
                },
            }}
        />
    );
};
