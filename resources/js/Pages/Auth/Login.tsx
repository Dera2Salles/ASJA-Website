import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { useLangue } from '@/page/lang/useLang';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertCircle,
    ArrowRight,
    Loader2,
    LogIn,
    ShieldCheck
} from 'lucide-react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { translate } = useLangue();
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title={translate('loginPage.seConnecter')} />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-2"
                >
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                        {translate('loginPage.seConnecter')}
                    </h2>
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
                        Accédez à votre espace ASJA
                    </p>
                </motion.div>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 rounded-2xl bg-asja-green-50 dark:bg-asja-green-900/10 border border-asja-green-100 dark:border-asja-green-900/20 text-asja-green-700 dark:text-asja-green-400 text-sm font-bold flex items-center gap-3"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        {status}
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 text-slate-400">
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
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoFocus
                            />
                            {errors.email && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-rose-500 text-[10px] font-black uppercase tracking-tight flex items-center gap-1 ml-1"
                                >
                                    <AlertCircle size={12} /> {errors.email}
                                </motion.p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between px-1">
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    {translate('loginPage.mdp')}
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[10px] text-asja-green-600 hover:text-asja-green-700 font-black uppercase tracking-widest transition-all"
                                    >
                                        Oublié ?
                                    </Link>
                                )}
                            </div>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="h-12 rounded-xl border-none bg-slate-50 dark:bg-zinc-800/50 focus:ring-2 focus:ring-asja-green-500/20 px-4 font-bold text-slate-900 dark:text-white placeholder:text-slate-300 transition-all"
                                autoComplete="current-password"
                                placeholder="••••••••"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            {errors.password && (
                                <motion.p
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="text-rose-500 text-[10px] font-black uppercase tracking-tight flex items-center gap-1 ml-1"
                                >
                                    <AlertCircle size={12} /> {errors.password}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center space-x-3 group cursor-pointer">
                            <Checkbox
                                id="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) => setData('remember', checked as boolean)}
                                className="w-5 h-5 rounded-md border-slate-200 dark:border-zinc-700 data-[state=checked]:bg-asja-green-600 data-[state=checked]:border-asja-green-600"
                            />
                            <Label 
                                htmlFor="remember" 
                                className="text-xs font-bold text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-colors cursor-pointer"
                            >
                                Se souvenir de moi
                            </Label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            disabled={processing}
                            className="w-full h-12 rounded-xl bg-asja-green-600 hover:bg-asja-green-700 text-white font-black uppercase tracking-widest shadow-xl shadow-asja-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>{translate('loginPage.seConnecter')}</span>
                                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                            {translate('loginPage.question')}{' '}
                            <Link
                                href={route('register')}
                                className="text-asja-green-600 hover:text-asja-green-700 ml-1 underline underline-offset-4"
                            >
                                {translate('loginPage.inscription')}
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
