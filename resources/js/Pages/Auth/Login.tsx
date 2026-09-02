import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { useLangue } from '@/page/lang/useLang';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';
import { FormEventHandler } from 'react';

const fieldLabel =
    'text-muted-foreground text-[11px] font-bold uppercase tracking-[0.14em]';

const fieldInput =
    'border-border bg-card text-foreground placeholder:text-muted-foreground h-12 px-4 text-[15px] font-medium';

/** Message d'erreur d'un champ, en rouge, sous le champ concerné. */
const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-destructive flex items-center gap-1.5 text-[12.5px] font-semibold"
        >
            <AlertCircle size={13} />
            {message}
        </motion.p>
    ) : null;

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

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <p className="app-eyebrow text-primary">Connexion</p>
                <h1
                    className="app-figure text-foreground mt-2.5 uppercase"
                    style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}
                >
                    Bon retour
                </h1>
                <p className="text-muted-foreground mt-3 text-[15px]">
                    Accédez à votre espace ASJA.
                </p>
            </motion.div>

            {status && (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border-primary bg-accent text-accent-foreground mt-8 flex items-center gap-3 rounded-2xl border p-4 text-sm font-semibold"
                >
                    <ShieldCheck className="size-5 shrink-0" />
                    {status}
                </motion.div>
            )}

            <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="mt-9 space-y-5"
            >
                <div className="space-y-2">
                    <Label htmlFor="email" className={fieldLabel}>
                        Adresse e-mail
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className={fieldInput}
                        autoComplete="username"
                        placeholder="votre@email.com"
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoFocus
                    />
                    <FieldError message={errors.email} />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between gap-4">
                        <Label htmlFor="password" className={fieldLabel}>
                            {translate('loginPage.mdp')}
                        </Label>
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-primary text-[12px] font-bold hover:underline"
                            >
                                Mot de passe oublié ?
                            </Link>
                        )}
                    </div>
                    <Input
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className={fieldInput}
                        autoComplete="current-password"
                        placeholder="••••••••"
                        onChange={(e) => setData('password', e.target.value)}
                        required
                    />
                    <FieldError message={errors.password} />
                </div>

                <div className="flex items-center gap-3 pt-1">
                    <Checkbox
                        id="remember"
                        checked={data.remember}
                        onCheckedChange={(checked) =>
                            setData('remember', checked as boolean)
                        }
                        className="border-input data-[state=checked]:bg-primary data-[state=checked]:border-primary size-[18px]"
                    />
                    <Label
                        htmlFor="remember"
                        className="text-muted-foreground cursor-pointer text-[13.5px] font-semibold"
                    >
                        Se souvenir de moi
                    </Label>
                </div>

                <Button
                    disabled={processing}
                    size="lg"
                    className="group mt-2 w-full font-bold"
                >
                    {processing ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <>
                            {translate('loginPage.seConnecter')}
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>

                <p className="text-muted-foreground pt-2 text-center text-[13.5px] font-medium">
                    {translate('loginPage.question')}{' '}
                    <Link
                        href={route('register')}
                        className="text-primary font-bold underline underline-offset-4"
                    >
                        {translate('loginPage.inscription')}
                    </Link>
                </p>
            </motion.form>
        </GuestLayout>
    );
}
