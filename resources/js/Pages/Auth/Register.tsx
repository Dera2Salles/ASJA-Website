import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Inscription" />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 text-center"
                >
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                        Créer un <span className="text-asja-green-600">Compte</span>
                    </h2>
                    <p className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">
                        Rejoignez l'Université ASJA
                    </p>
                </motion.div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="name"
                                className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                            >
                                Nom Complet
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                value={data.name}
                                className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                                autoComplete="name"
                                placeholder="John Doe"
                                onChange={(e) =>
                                    setData('name', e.target.value)
                                }
                                required
                                autoFocus
                            />
                            {errors.name && (
                                <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                    <AlertCircle size={12} /> {errors.name}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                            >
                                Adresse Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                                autoComplete="username"
                                placeholder="votre@email.com"
                                onChange={(e) =>
                                    setData('email', e.target.value)
                                }
                                required
                            />
                            {errors.email && (
                                <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                    <AlertCircle size={12} /> {errors.email}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label
                                    htmlFor="password"
                                    className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    Mot de passe
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) =>
                                        setData('password', e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label
                                    htmlFor="password_confirmation"
                                    className="ml-1 text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase"
                                >
                                    Confirmation
                                </Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    name="password_confirmation"
                                    value={data.password_confirmation}
                                    className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                                    autoComplete="new-password"
                                    placeholder="••••••••"
                                    onChange={(e) =>
                                        setData(
                                            'password_confirmation',
                                            e.target.value,
                                        )
                                    }
                                    required
                                />
                            </div>
                        </div>
                        {errors.password && (
                            <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={12} /> {errors.password}
                            </p>
                        )}
                        {errors.password_confirmation && (
                            <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={12} />{' '}
                                {errors.password_confirmation}
                            </p>
                        )}
                    </div>

                    <div className="pt-6">
                        <Button
                            disabled={processing}
                            className="h-12 rounded-xl bg-asja-green-600 hover:bg-asja-green-700 text-white font-black uppercase tracking-widest shadow-xl shadow-asja-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>S'inscrire</span>
                                    <ArrowRight className="ml-auto h-4 w-4 -translate-x-4 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">
                            Déjà inscrit ?{' '}
                            <Link
                                href={route('login')}
                                className="text-asja-green-600 hover:text-asja-green-700 ml-1 underline underline-offset-4"
                            >
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
