import Logo from '@/assets/Logo/asja-logo.png';
import { ThemeProvider } from '@/page/theme/useThemeProvider';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

function GuestContent({ children }: PropsWithChildren) {
    return (
        <div className="bg-background flex min-h-screen flex-col items-center justify-center p-6">
            <div className="w-full sm:max-w-[450px]">
                <div className="mb-10 flex flex-col items-center justify-center">
                    <Link href="/" className="flex flex-col items-center gap-4">
                        <div className="border-border bg-primary border p-3">
                            <img
                                src={Logo}
                                alt="ASJA Logo"
                                className="h-16 w-16"
                            />
                        </div>
                        <div className="space-y-1 text-center">
                            <h1 className="text-foreground text-2xl font-black tracking-[0.2em] uppercase">
                                Université <span className="text-primary">ASJA</span>
                            </h1>
                            <div className="bg-primary mx-auto h-1 w-12" />
                        </div>
                    </Link>
                </div>

                <div className="border-border bg-background border px-8 py-10 sm:px-12 sm:py-12">
                    {children}
                </div>

                <div className="mt-12 text-center">
                    <div className="text-muted-foreground font-mono text-[10px] font-black tracking-[0.4em] uppercase">
                        © {new Date().getFullYear()} Université ASJA
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Guest({ children }: PropsWithChildren) {
    return (
        <ThemeProvider>
            <GuestContent>{children}</GuestContent>
        </ThemeProvider>
    );
}
