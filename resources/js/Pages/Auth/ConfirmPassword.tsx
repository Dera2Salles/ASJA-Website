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
                    <div className="bg-primary text-primary-foreground border-border mx-auto flex h-16 w-16 items-center justify-center border">
                        <Lock size={32} />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white uppercase">
                            Zone <span className="text-primary">Sécurisée</span>
                        </h2>
                        <p className="px-4 text-[10px] leading-relaxed font-black tracking-widest text-muted-foreground uppercase">
                            Veuillez confirmer votre mot de passe avant de
                            continuer.
                        </p>
                    </div>
                </motion.div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <Label
                            htmlFor="password"
                            className="ml-1 text-[10px] font-black tracking-widest text-muted-foreground uppercase"
                        >
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className="h-12 border border-border bg-background px-4 font-bold text-foreground placeholder:text-muted-foreground"
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
                            className="h-12 bg-primary border border-border hover:bg-background hover:text-primary text-primary-foreground font-black uppercase tracking-widest flex gap-3 group/btn"
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
