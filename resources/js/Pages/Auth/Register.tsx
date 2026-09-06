import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

interface Props {
    mentions: { slug: string; name: string }[];
    levels: string[];
}

const fieldLabel =
    'text-muted-foreground text-[11px] font-bold uppercase tracking-[0.14em]';

const fieldInput =
    'border-border bg-card text-foreground placeholder:text-muted-foreground h-12 px-4 text-[15px] font-medium';

/* Le sélecteur natif, plutôt que celui de Radix : sa liste s'ouvre dans un
   portail, hors de l'enveloppe `square-corners` de l'écran, et y garderait des
   angles arrondis. Sur téléphone il ouvre en plus la roue du système. */
const fieldSelect = `${fieldInput} border w-full`;

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

/**
 * Inscription en ligne.
 *
 * Le formulaire ne demandait que nom, e-mail et mot de passe : le compte créé
 * n'était rattaché à aucune mention, donc invisible dans les listes de
 * l'administration, qui filtrent par mention et par niveau. La fiche scolaire
 * se saisit donc ici, et se met à jour ensuite depuis l'espace étudiant — c'est
 * la réinscription.
 */
export default function Register({ mentions, levels }: Props) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        last_name: '',
        contact: '',
        mention: '',
        level: '',
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

            <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
            >
                <p className="app-eyebrow text-primary">Inscription</p>
                <h1
                    className="app-figure text-foreground mt-2.5 uppercase"
                    style={{ fontSize: 'clamp(32px, 4vw, 44px)' }}
                >
                    Rejoindre l'ASJA
                </h1>
                <p className="text-muted-foreground mt-3 text-[15px]">
                    Créez votre compte étudiant : votre fiche part directement
                    au service de scolarité.
                </p>
            </motion.div>

            <motion.form
                onSubmit={submit}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="mt-9 space-y-5"
            >
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="name" className={fieldLabel}>
                            Nom
                        </Label>
                        <Input
                            id="name"
                            name="name"
                            value={data.name}
                            className={fieldInput}
                            autoComplete="family-name"
                            placeholder="Rakoto"
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                        />
                        <FieldError message={errors.name} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="last_name" className={fieldLabel}>
                            Prénom
                        </Label>
                        <Input
                            id="last_name"
                            name="last_name"
                            value={data.last_name}
                            className={fieldInput}
                            autoComplete="given-name"
                            placeholder="Hery"
                            onChange={(e) =>
                                setData('last_name', e.target.value)
                            }
                        />
                        <FieldError message={errors.last_name} />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="contact" className={fieldLabel}>
                        Contact
                    </Label>
                    <Input
                        id="contact"
                        name="contact"
                        value={data.contact}
                        className={fieldInput}
                        autoComplete="tel"
                        placeholder="034 00 000 00"
                        onChange={(e) => setData('contact', e.target.value)}
                    />
                    <FieldError message={errors.contact} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="mention" className={fieldLabel}>
                            Mention souhaitée
                        </Label>
                        <select
                            id="mention"
                            name="mention"
                            value={data.mention}
                            className={fieldSelect}
                            onChange={(e) => setData('mention', e.target.value)}
                        >
                            <option value="">Choisir…</option>
                            {mentions.map((mention) => (
                                <option key={mention.slug} value={mention.slug}>
                                    {mention.name}
                                </option>
                            ))}
                        </select>
                        <FieldError message={errors.mention} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="level" className={fieldLabel}>
                            Niveau
                        </Label>
                        <select
                            id="level"
                            name="level"
                            value={data.level}
                            className={fieldSelect}
                            onChange={(e) => setData('level', e.target.value)}
                        >
                            <option value="">Choisir…</option>
                            {levels.map((level) => (
                                <option key={level} value={level}>
                                    {level}
                                </option>
                            ))}
                        </select>
                        <FieldError message={errors.level} />
                    </div>
                </div>

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
                    />
                    <FieldError message={errors.email} />
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="password" className={fieldLabel}>
                            Mot de passe
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            value={data.password}
                            className={fieldInput}
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
                            className={fieldLabel}
                        >
                            Confirmation
                        </Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            name="password_confirmation"
                            value={data.password_confirmation}
                            className={fieldInput}
                            autoComplete="new-password"
                            placeholder="••••••••"
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            required
                        />
                    </div>
                </div>
                <FieldError message={errors.password} />

                <Button
                    disabled={processing}
                    size="lg"
                    className="group mt-2 w-full font-bold"
                >
                    {processing ? (
                        <Loader2 className="size-5 animate-spin" />
                    ) : (
                        <>
                            Créer mon compte
                            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </>
                    )}
                </Button>

                <p className="text-muted-foreground pt-2 text-center text-[13.5px] font-medium">
                    Déjà inscrit ?{' '}
                    <Link
                        href={route('login')}
                        className="text-primary font-bold underline underline-offset-4"
                    >
                        Se connecter
                    </Link>
                </p>
            </motion.form>
        </GuestLayout>
    );
}
