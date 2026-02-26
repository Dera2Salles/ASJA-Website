import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Loader2,
    Lock
} from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ConfirmPassword() {
    const { data, setData, post, processing, errors, reset } = useForm({
        password: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.confirm'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Confirmation du mot de passe" />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                >
                    <div className="bg-asja-green-50 dark:bg-asja-green-900/10 text-asja-green-600 dark:text-asja-green-400 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                        <Lock size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            Zone <span className="text-asja-green-600">Sécurisée</span>
                        </h2>
                        <p className="px-4 text-[10px] leading-relaxed font-black tracking-widest text-slate-400 uppercase">
                            Veuillez confirmer votre mot de passe avant de
                            continuer.
                        </p>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                        >
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all font-bold"
                            onChange={(e) =>
                                setData('password', e.target.value)
                            }
                            required
                            autoFocus
                        />
                        {errors.password && (
                            <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                <AlertCircle size={12} /> {errors.password}
                            </p>
                        )}
                    </div>

                    <div className="pt-4">
                        <Button
                            disabled={processing}
                            className="h-12 rounded-xl bg-asja-green-600 hover:bg-asja-green-700 text-white font-black uppercase tracking-widest shadow-xl shadow-asja-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Confirmer</span>
                                    <ArrowRight className="ml-auto h-4 w-4 -translate-x-4 opacity-0 transition-all duration-300 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
