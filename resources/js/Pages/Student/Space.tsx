import { CmsProvider, type CmsContent } from '@/lib/cms';
import { type PageProps } from '@/types';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, Check, Loader2, LogOut, UserCog } from 'lucide-react';
import { type FormEventHandler } from 'react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Props {
    mentions: { slug: string; name: string }[];
    levels: string[];
    cms: CmsContent;
}

const fieldLabel =
    'text-muted-foreground block text-[11px] font-bold uppercase tracking-[0.14em]';

const fieldBox =
    'border-border bg-card text-foreground placeholder:text-muted-foreground h-12 w-full border px-4 text-[15px] font-medium';

const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <p className="text-destructive mt-1.5 flex items-center gap-1.5 text-[12.5px] font-semibold">
            <AlertCircle size={13} />
            {message}
        </p>
    ) : null;

/** Une ligne de la fiche telle qu'elle est enregistrée, en lecture seule. */
const Summary = ({ label, value }: { label: string; value?: string }) => (
    <div className="border-border border-t py-3.5">
        <p className="text-muted-foreground text-[11px] font-bold tracking-[0.14em] uppercase">
            {label}
        </p>
        <p className="text-foreground mt-1 text-[15px] font-semibold">
            {value || '—'}
        </p>
    </div>
);

/**
 * Espace étudiant.
 *
 * La fiche s'affiche à gauche telle qu'elle est en base, et se modifie à
 * droite : c'est le même formulaire qui sert à l'inscription et à la
 * réinscription — déclarer sa mention et son niveau pour la nouvelle année.
 */
export default function StudentSpace({ mentions, levels, cms }: Props) {
    const { auth } = usePage<PageProps>().props;
    const user = auth.user;

    const mentionName =
        mentions.find((mention) => mention.slug === user.mention)?.name ??
        user.mention ??
        '';

    const { data, setData, patch, processing, errors, recentlySuccessful } =
        useForm({
            name: user.name ?? '',
            last_name: user.last_name ?? '',
            contact: user.contact ?? '',
            mention: user.mention ?? '',
            level: user.level ?? '',
            branche: user.branche ?? '',
        });

    const submit: FormEventHandler = (event) => {
        event.preventDefault();
        patch(route('student.file.update'), { preserveScroll: true });
    };

    return (
        <CmsProvider content={cms}>
            <ThemeProvider>
                <Head title="Espace étudiant" />

                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        {/* En-tête sombre, dans la continuité des bannières du
                        site : le nom de l'étudiant tient le rôle du titre. */}
                        <section className="band-dark pt-14 pb-12 sm:pt-16 sm:pb-14">
                            <div className="section-shell">
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="eyebrow"
                                >
                                    Espace étudiant
                                </motion.p>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.08 }}
                                    className="font-display text-foreground mt-3 leading-[0.98] font-black tracking-[-0.03em] uppercase"
                                    style={{
                                        fontSize: 'clamp(30px, 6.6vw, 56px)',
                                    }}
                                >
                                    {[user.name, user.last_name]
                                        .filter(Boolean)
                                        .join(' ')}
                                </motion.h1>

                                <div className="mt-6 flex flex-wrap items-center gap-2.5">
                                    <Link
                                        href={route('profile.edit')}
                                        className="border-border text-foreground hover:border-primary hover:text-primary inline-flex min-h-[44px] items-center gap-2 border px-4 text-[13.5px] font-semibold"
                                    >
                                        <UserCog size={15} />
                                        Adresse e-mail & mot de passe
                                    </Link>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="border-border text-muted-foreground hover:border-destructive hover:text-destructive inline-flex min-h-[44px] cursor-pointer items-center gap-2 border px-4 text-[13.5px] font-semibold"
                                    >
                                        <LogOut size={15} />
                                        Se déconnecter
                                    </Link>
                                </div>
                            </div>
                        </section>

                        <section className="band-light section-rhythm">
                            <div className="section-shell">
                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-16">
                                    {/* Fiche enregistrée */}
                                    <div>
                                        <h2 className="font-display text-foreground text-[clamp(22px,4vw,30px)] leading-tight font-black uppercase">
                                            Ma fiche
                                        </h2>
                                        <p className="text-muted-foreground mt-2 text-[14.5px] leading-relaxed">
                                            Ce que l'administration voit de
                                            votre dossier.
                                        </p>

                                        <div className="mt-6">
                                            <Summary
                                                label="Nom"
                                                value={user.name}
                                            />
                                            <Summary
                                                label="Prénom"
                                                value={user.last_name ?? ''}
                                            />
                                            <Summary
                                                label="Contact"
                                                value={user.contact ?? ''}
                                            />
                                            <Summary
                                                label="Mention"
                                                value={mentionName}
                                            />
                                            <Summary
                                                label="Niveau"
                                                value={user.level ?? ''}
                                            />
                                            <Summary
                                                label="Parcours"
                                                value={user.branche ?? ''}
                                            />
                                            <Summary
                                                label="Adresse e-mail"
                                                value={user.email}
                                            />
                                        </div>
                                    </div>

                                    {/* Réinscription : la mise à jour de la fiche */}
                                    <div>
                                        <h2 className="font-display text-foreground text-[clamp(22px,4vw,30px)] leading-tight font-black uppercase">
                                            Réinscription
                                        </h2>
                                        <p className="text-muted-foreground mt-2 text-[14.5px] leading-relaxed">
                                            Déclarez la mention et le niveau de
                                            votre nouvelle année, puis
                                            enregistrez.
                                        </p>

                                        <form
                                            onSubmit={submit}
                                            className="mt-6 space-y-5"
                                        >
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="name"
                                                        className={fieldLabel}
                                                    >
                                                        Nom
                                                    </label>
                                                    <input
                                                        id="name"
                                                        className={`mt-2 ${fieldBox}`}
                                                        value={data.name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'name',
                                                                e.target.value,
                                                            )
                                                        }
                                                        required
                                                    />
                                                    <FieldError
                                                        message={errors.name}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="last_name"
                                                        className={fieldLabel}
                                                    >
                                                        Prénom
                                                    </label>
                                                    <input
                                                        id="last_name"
                                                        className={`mt-2 ${fieldBox}`}
                                                        value={data.last_name}
                                                        onChange={(e) =>
                                                            setData(
                                                                'last_name',
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <FieldError
                                                        message={
                                                            errors.last_name
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="contact"
                                                    className={fieldLabel}
                                                >
                                                    Contact
                                                </label>
                                                <input
                                                    id="contact"
                                                    className={`mt-2 ${fieldBox}`}
                                                    value={data.contact}
                                                    placeholder="034 00 000 00"
                                                    onChange={(e) =>
                                                        setData(
                                                            'contact',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldError
                                                    message={errors.contact}
                                                />
                                            </div>

                                            {/* Sélecteurs natifs : la liste
                                            déroulante de Radix s'affiche dans
                                            un portail, hors de l'enveloppe
                                            `square-corners`, et y reprendrait
                                            ses angles arrondis. */}
                                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                                <div>
                                                    <label
                                                        htmlFor="mention"
                                                        className={fieldLabel}
                                                    >
                                                        Mention
                                                    </label>
                                                    <select
                                                        id="mention"
                                                        className={`mt-2 ${fieldBox}`}
                                                        value={data.mention}
                                                        onChange={(e) =>
                                                            setData(
                                                                'mention',
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Choisir…
                                                        </option>
                                                        {mentions.map(
                                                            (mention) => (
                                                                <option
                                                                    key={
                                                                        mention.slug
                                                                    }
                                                                    value={
                                                                        mention.slug
                                                                    }
                                                                >
                                                                    {
                                                                        mention.name
                                                                    }
                                                                </option>
                                                            ),
                                                        )}
                                                    </select>
                                                    <FieldError
                                                        message={errors.mention}
                                                    />
                                                </div>

                                                <div>
                                                    <label
                                                        htmlFor="level"
                                                        className={fieldLabel}
                                                    >
                                                        Niveau
                                                    </label>
                                                    <select
                                                        id="level"
                                                        className={`mt-2 ${fieldBox}`}
                                                        value={data.level}
                                                        onChange={(e) =>
                                                            setData(
                                                                'level',
                                                                e.target.value,
                                                            )
                                                        }
                                                    >
                                                        <option value="">
                                                            Choisir…
                                                        </option>
                                                        {levels.map((level) => (
                                                            <option
                                                                key={level}
                                                                value={level}
                                                            >
                                                                {level}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <FieldError
                                                        message={errors.level}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="branche"
                                                    className={fieldLabel}
                                                >
                                                    Parcours
                                                </label>
                                                <input
                                                    id="branche"
                                                    className={`mt-2 ${fieldBox}`}
                                                    value={data.branche}
                                                    placeholder="Génie logiciel, Droit des affaires…"
                                                    onChange={(e) =>
                                                        setData(
                                                            'branche',
                                                            e.target.value,
                                                        )
                                                    }
                                                />
                                                <FieldError
                                                    message={errors.branche}
                                                />
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4 pt-1">
                                                <button
                                                    type="submit"
                                                    disabled={processing}
                                                    className="bg-primary text-primary-foreground inline-flex min-h-[48px] cursor-pointer items-center gap-2 px-7 text-[15px] font-bold disabled:opacity-60"
                                                >
                                                    {processing ? (
                                                        <Loader2 className="size-5 animate-spin" />
                                                    ) : (
                                                        'Enregistrer ma fiche'
                                                    )}
                                                </button>

                                                {recentlySuccessful ? (
                                                    <span className="text-primary inline-flex items-center gap-1.5 text-[13.5px] font-bold">
                                                        <Check size={15} />
                                                        Enregistré
                                                    </span>
                                                ) : null}
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </main>

                    <Footer />
                </div>
            </ThemeProvider>
        </CmsProvider>
    );
}
