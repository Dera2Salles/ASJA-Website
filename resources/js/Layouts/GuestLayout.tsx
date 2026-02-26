import Logo from '@/assets/Logo/asja-logo.png';
import { useThemeContext } from '@/page/theme/useThemeContext';
import { ThemeProvider } from '@/page/theme/useThemeProvider';
import { Link } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

function GuestContent({ children }: PropsWithChildren) {
    const { isDark } = useThemeContext();

    return (
        <div className="selection:bg-asja-green-500/30 relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-50 p-6 dark:bg-zinc-950">
            {/* Soft decorative background element */}
            <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
                <div className="bg-asja-green-500/[0.03] absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full blur-[120px]" />
                <div className="bg-asja-green-600/[0.02] absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full blur-[100px]" />
            </div>

            <div className="z-10 w-full sm:max-w-[450px]">
                <div className="group mb-10 flex cursor-default flex-col items-center justify-center">
                    <Link href="/" className="flex flex-col items-center gap-4">
                        <div className="relative">
                            <div className="bg-asja-green-500/10 absolute inset-0 scale-125 rounded-full opacity-0 blur-xl transition-transform duration-700 group-hover:scale-150 group-hover:opacity-100" />
                            <img
                                src={Logo}
                                alt="ASJA Logo"
                                className="animate-fade-in relative z-10 h-20 w-20 drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>
                        <div className="space-y-1 text-center">
                            <h1 className="text-2xl font-black tracking-[0.2em] text-slate-900 uppercase dark:text-white">
                                Université{' '}
                                <span className="text-asja-green-600">
                                    ASJA
                                </span>
                            </h1>
                            <div className="bg-asja-green-600 mx-auto h-1 w-12 rounded-full transition-all duration-500 group-hover:w-20" />
                        </div>
                    </Link>
                </div>

                <div className="group/card overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white px-8 py-10 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] transition-all duration-500 hover:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.1)] sm:px-12 sm:py-12 dark:border-zinc-800/50 dark:bg-zinc-900 dark:shadow-[0_30px_60px_rgba(0,0,0,0.4)]">
                    <div className="relative z-10">{children}</div>
                </div>

                <div className="mt-12 text-center">
                    <div className="text-[10px] font-black tracking-[0.4em] text-slate-400 uppercase dark:text-zinc-500">
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
