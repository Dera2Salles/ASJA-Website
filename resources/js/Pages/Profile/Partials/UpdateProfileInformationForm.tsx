import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <form onSubmit={submit} className="max-w-xl space-y-8">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="name"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Nom Complet
                        </Label>
                        <Input
                            id="name"
                            className="focus:ring-ring/20 h-12 rounded-xl border-none bg-slate-50 px-4 font-bold focus:ring-2 dark:bg-white/5"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoComplete="name"
                        />
                        {errors.name && (
                            <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={10} /> {errors.name}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="email"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Adresse Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            className="focus:ring-ring/20 h-12 rounded-xl border-none bg-slate-50 px-4 font-bold focus:ring-2 dark:bg-white/5"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                        />
                        {errors.email && (
                            <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={10} /> {errors.email}
                            </p>
                        )}
                    </div>
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 dark:border-amber-900/20 dark:bg-amber-900/10">
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                            Votre adresse email n'est pas vérifiée.
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="mt-1 block text-xs font-black tracking-widest text-amber-600 uppercase underline underline-offset-4 hover:text-amber-700"
                            >
                                Renvoyer l'email de vérification
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="text-primary dark:text-primary animate-in fade-in slide-in-from-top-2 mt-4 flex items-center gap-2 text-sm font-black">
                                <CheckCircle2 size={16} />
                                Un nouveau lien a été envoyé.
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-6 pt-4">
                    <Button
                        disabled={processing}
                        className="bg-primary dark:bg-primary shadow-primary/20 flex h-12 gap-2 rounded-xl px-8 font-black text-white shadow-xl transition-all hover:scale-105 active:scale-95"
                    >
                        {processing && (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Enregistrer
                    </Button>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out duration-300"
                        enterFrom="opacity-0 translate-x-4"
                        enterTo="opacity-100 translate-x-0"
                        leave="transition ease-in-out duration-300"
                        leaveTo="opacity-0 translate-x-4"
                    >
                        <p className="text-primary dark:text-primary flex items-center gap-2 text-sm font-black">
                            <CheckCircle2 size={18} />
                            Modifications enregistrées
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
