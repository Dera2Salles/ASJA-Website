import { PropsWithChildren } from 'react';
import { Toaster } from 'react-hot-toast';
import { AdminSidebar } from './Partials/AdminSidebar';

export default function AdminLayout({ children }: PropsWithChildren) {
    return (
        <div className="bg-background flex min-h-screen overflow-hidden">
            <Toaster position="top-right" />

            {}
            <AdminSidebar />

            {}
            <main className="scrollbar-premium relative flex flex-1 flex-col overflow-auto">
                <div className="z-10 mx-auto w-full max-w-[1600px] p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
