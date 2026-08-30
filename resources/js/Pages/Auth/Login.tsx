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
                    <h2 className="text-3xl font-black text-foreground dark:text-white uppercase tracking-tight">
                        {translate('loginPage.seConnecter')}
                    </h2>
                    <p className="text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        Accédez à votre espace ASJA
                    </p>
                </motion.div>

                {status && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-4 border border-primary bg-background text-primary text-sm font-bold flex items-center gap-3"
                    >
                        <ShieldCheck className="w-5 h-5" />
                        {status}
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest ml-1 text-muted-foreground">
                                Adresse Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
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
                                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    {translate('loginPage.mdp')}
                                </Label>
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-[10px] text-primary hover:text-primary font-black uppercase tracking-widest transition-all"
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
                                className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
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
                                className="w-5 h-5 border border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <Label 
                                htmlFor="remember" 
                                className="text-xs font-bold text-muted-foreground group-hover:text-muted-foreground transition-colors cursor-pointer"
                            >
                                Se souvenir de moi
                            </Label>
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button 
                            disabled={processing}
                            className="w-full h-12 bg-primary border border-border hover:bg-background hover:text-primary text-primary-foreground font-black uppercase tracking-widest flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    <span>{translate('loginPage.seConnecter')}</span>
                                    <ArrowRight className="w-5 h-5 ml-auto opacity-0 group-hover:opacity-100" />
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="pt-6 text-center">
                        <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">
                            {translate('loginPage.question')}{' '}
                            <Link
                                href={route('register')}
                                className="text-primary hover:text-primary ml-1 underline underline-offset-4"
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
