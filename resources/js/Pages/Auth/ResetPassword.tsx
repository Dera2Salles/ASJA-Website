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
    RotateCcw
} from 'lucide-react';
import { FormEventHandler } from 'react';

export default function ResetPassword({
    token,
    email,
}: {
    token: string;
    email: string;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        token: token,
        email: email,
        password: '',
        password_confirmation: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.store'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Réinitialiser le mot de passe" />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                >
                    <div className="bg-primary text-primary-foreground border-border mx-auto flex h-16 w-16 items-center justify-center border">
                        <RotateCcw size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white uppercase">
                            Nouveau <span className="text-primary">Mot de Passe</span>
                        </h2>
                        <p className="text-[10px] font-black tracking-widest text-muted-foreground uppercase">
                            Sécurisez votre compte ASJA
                        </p>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="email"
                                className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                            >
                                Adresse Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
                                autoComplete="username"
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="password"
                                className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                            >
                                Nouveau mot de passe
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
                                autoComplete="new-password"
                                placeholder="••••••••"
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

                        <div className="space-y-2">
                            <Label
                                htmlFor="password_confirmation"
                                className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                            >
                                Confirmer le mot de passe
                            </Label>
                            <Input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
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
                            {errors.password_confirmation && (
                                <p className="ml-1 flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                    <AlertCircle size={12} />{' '}
                                    {errors.password_confirmation}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            disabled={processing}
                            className="h-12 bg-primary border border-border hover:bg-background hover:text-primary text-primary-foreground font-black uppercase tracking-widest flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Réinitialiser</span>
                                    <ArrowRight className="ml-auto h-4 w-4 -translate-x-4 opacity-0 transition-all duration-300 group-hover/btn:translate-x-0 group-hover/btn:opacity-100" />
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
