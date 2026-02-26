import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, KeyRound, Loader2 } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm({
    className = '',
}: {
    className?: string;
}) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <form onSubmit={updatePassword} className="max-w-xl space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="current_password"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Mot de passe actuel
                        </Label>
                        <div className="relative">
                            <Input
                                id="current_password"
                                ref={currentPasswordInput}
                                value={data.current_password}
                                onChange={(e) =>
                                    setData('current_password', e.target.value)
                                }
                                type="password"
                                className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50 px-4 pr-10 font-bold focus:ring-2 dark:bg-white/5"
                                autoComplete="current-password"
                            />
                            <KeyRound className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
                        </div>
                        {errors.current_password && (
                            <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={10} />{' '}
                                {errors.current_password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Nouveau mot de passe
                        </Label>
                        <div className="relative">
                            <Input
                                id="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                type="password"
                                className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50 px-4 pr-10 font-bold focus:ring-2 dark:bg-white/5"
                                autoComplete="new-password"
                            />
                            <KeyRound className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
                        </div>
                        {errors.password && (
                            <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={10} /> {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="password_confirmation"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Confirmer le mot de passe
                        </Label>
                        <div className="relative">
                            <Input
                                id="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) =>
                                    setData(
                                        'password_confirmation',
                                        e.target.value,
                                    )
                                }
                                type="password"
                                className="focus:ring-asja-green-500/20 h-12 rounded-xl border-none bg-slate-50 px-4 pr-10 font-bold focus:ring-2 dark:bg-white/5"
                                autoComplete="new-password"
                            />
                            <KeyRound className="absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-slate-300" />
                        </div>
                        {errors.password_confirmation && (
                            <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={10} />{' '}
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-6 pt-4">
                    <Button
                        disabled={processing}
                        className="bg-asja-green-600 dark:bg-primary shadow-asja-green-900/20 flex h-12 gap-2 rounded-xl px-8 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        {processing && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Mettre à jour
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-x-4"
                    >
                        <p className="text-asja-green-600 dark:text-primary flex items-center gap-2 text-sm font-black">
                            <CheckCircle2 size={18} />
                            Mot de passe mis à jour
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
