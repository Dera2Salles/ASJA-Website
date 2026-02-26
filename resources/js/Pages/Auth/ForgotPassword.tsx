import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowLeft,
    Loader2,
    Send,
    ShieldQuestion
} from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Récupération de mot de passe" />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                >
                    <div className="bg-asja-green-50 dark:bg-asja-green-900/10 text-asja-green-600 dark:text-asja-green-400 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                        <ShieldQuestion size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            Mot de passe oublié ?
                        </h2>
                        <p className="px-4 text-[10px] leading-relaxed font-black tracking-widest text-slate-400 uppercase">
                            Saisissez votre email pour recevoir un lien de
                            réinitialisation.
                        </p>
                    </div>
                </motion.div>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-asja-green-50 dark:bg-asja-green-900/10 border border-asja-green-100 dark:border-asja-green-900/20 text-asja-green-700 dark:text-asja-green-400 animate-in fade-in flex items-center gap-3 rounded-2xl p-4 text-sm font-bold"
                    >
                        <Send className="h-4 w-4" />
                        {status}
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-6">
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
                            name="email"
                            value={data.email}
                            className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                            onChange={(e) =>
                                setData('email', e.target.value)
                            }
                            placeholder="votre@email.com"
                            required
                            autoFocus
                        />
                        {errors.email && (
                            <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={12} /> {errors.email}
                            </p>
                        )}
                    </div>

                    <div className="space-y-4 pt-2">
                        <Button
                            disabled={processing}
                            className="h-12 rounded-xl bg-asja-green-600 hover:bg-asja-green-700 text-white font-black uppercase tracking-widest shadow-xl shadow-asja-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Envoyer le lien</span>
                                    <Send className="h-4 w-4 ml-auto opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                </>
                            )}
                        </Button>

                        <Link
                            href={route('login')}
                            className="group/back flex items-center justify-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-asja-green-600"
                        >
                            <ArrowLeft className="h-4 w-4 transition-transform group-hover/back:-translate-x-1" />
                            Retour à la connexion
                        </Link>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
