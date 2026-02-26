import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from './Partials/AdminSidebar';

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <div className="bg-background flex min-h-screen overflow-hidden transition-colors duration-500">
            <Toaster position="top-right" />

            {}
            <AdminSidebar />

            {}
            <main className="scrollbar-premium relative flex flex-1 flex-col overflow-auto">
                {}

                <div className="z-10 mx-auto w-full max-w-[1600px] p-6 lg:p-10">
                    {children}
                </div>

                {}
                <div className="bg-asja-green-200/20 dark:bg-asja-green-900/10 pointer-events-none fixed top-[-10%] right-[-10%] -z-10 h-[600px] w-[600px] animate-pulse rounded-full blur-[120px]" />
                <div className="bg-primary/10 animate-bounce-slow pointer-events-none fixed bottom-[-10%] left-[10%] -z-10 h-[400px] w-[400px] rounded-full blur-[100px]" />
            </main>
        </div>
    );
}
