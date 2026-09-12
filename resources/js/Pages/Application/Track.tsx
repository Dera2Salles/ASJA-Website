import { Seo } from '@/Components/Seo';
import { CmsProvider, type CmsContent } from '@/lib/cms';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { AlertCircle, ArrowRight, Loader2, Search } from 'lucide-react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Props {
    cms: CmsContent;
}

/**
 * Retrouver un dossier déjà déposé.
 *
 * Deux champs, et pas un de plus : le numéro de demande, et l'adresse e-mail
 * déclarée au dépôt. Le numéro seul ne suffit pas — il est séquentiel, donc
 * devinable, et l'ouvrir sur ce seul motif reviendrait à publier les dossiers
 * les uns après les autres. L'adresse fait le second facteur.
 *
 * La page ne dit jamais si un numéro existe : l'erreur est la même dans les
 * deux cas, et le serveur borne la cadence des essais.
 */
export default function ApplicationTrack({ cms }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        reference: '',
        email: '',
    });

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        if (processing) return;

        post(route('candidature.suivi.find'), { preserveScroll: true });
    };

    return (
        <CmsProvider content={cms}>
            <ThemeProvider>
                <Head title="Compléter mon dossier" />
                <Seo />

                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        <section className="band-light pt-14 pb-12 sm:pt-16 sm:pb-14">
                            <div className="section-shell">
                                <motion.p
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    className="eyebrow"
                                >
                                    Scolarité
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
                                    Compléter mon dossier
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.16 }}
                                    className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed"
                                >
                                    Suivez l’avancement de votre demande,
                                    déposez les pièces que le service de la
                                    scolarité vous réclame, ou transmettez votre
                                    bordereau de versement des frais généraux.
                                    Vous n’avez rien à ressaisir : votre dossier
                                    est déjà enregistré.
                                </motion.p>
                            </div>
                        </section>

                        <section className="band-light section-rhythm">
                            <div className="section-shell">
                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-16">
                                    <form
                                        onSubmit={submit}
                                        noValidate
                                        className="border-border bg-card border p-6 sm:p-8"
                                    >
                                        <h2 className="text-foreground text-[17px] font-bold tracking-[0.02em]">
                                            Retrouver ma demande
                                        </h2>
                                        <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                                            Les deux informations figurent sur
                                            l’accusé de réception qui vous a été
                                            envoyé par e-mail.
                                        </p>

                                        <div className="mt-6 space-y-5">
                                            <div>
                                                <label
                                                    htmlFor="reference"
                                                    className="text-foreground block text-[13px] font-bold tracking-[0.1em] uppercase"
                                                >
                                                    Numéro de demande
                                                </label>
                                                <input
                                                    id="reference"
                                                    name="reference"
                                                    type="text"
                                                    inputMode="text"
                                                    autoComplete="off"
                                                    spellCheck={false}
                                                    placeholder="ASJA-2026-0001"
                                                    value={data.reference}
                                                    onChange={(event) =>
                                                        setData(
                                                            'reference',
                                                            event.target.value.toUpperCase(),
                                                        )
                                                    }
                                                    className={`bg-background text-foreground mt-2 h-12 w-full border px-3 text-[15px] tracking-[0.06em] ${
                                                        errors.reference
                                                            ? 'border-destructive'
                                                            : 'border-border focus:border-primary'
                                                    }`}
                                                />
                                            </div>

                                            <div>
                                                <label
                                                    htmlFor="email"
                                                    className="text-foreground block text-[13px] font-bold tracking-[0.1em] uppercase"
                                                >
                                                    Adresse e-mail
                                                </label>
                                                <input
                                                    id="email"
                                                    name="email"
                                                    type="email"
                                                    autoComplete="email"
                                                    placeholder="vous@exemple.mg"
                                                    value={data.email}
                                                    onChange={(event) =>
                                                        setData(
                                                            'email',
                                                            event.target.value,
                                                        )
                                                    }
                                                    className={`bg-background text-foreground mt-2 h-12 w-full border px-3 text-[15px] ${
                                                        errors.email
                                                            ? 'border-destructive'
                                                            : 'border-border focus:border-primary'
                                                    }`}
                                                />
                                                <p className="text-muted-foreground mt-2 text-[12.5px] leading-relaxed">
                                                    Celle que vous avez indiquée
                                                    au moment du dépôt.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Une seule erreur possible en
                                            pratique : le couple numéro/adresse
                                            ne désigne aucun dossier. Elle ne dit
                                            pas lequel des deux est en cause. */}
                                        {(errors.reference || errors.email) && (
                                            <p
                                                role="alert"
                                                className="border-destructive/60 bg-destructive/5 text-destructive mt-5 flex items-start gap-2 border p-4 text-[13.5px] leading-relaxed font-semibold"
                                            >
                                                <AlertCircle
                                                    size={16}
                                                    className="mt-0.5 shrink-0"
                                                />
                                                {errors.reference ??
                                                    errors.email}
                                            </p>
                                        )}

                                        <button
                                            type="submit"
                                            disabled={processing}
                                            className="bg-primary text-primary-foreground mt-6 inline-flex min-h-[48px] w-full items-center justify-center gap-2 px-7 text-[14px] font-bold hover:bg-[#08542c] hover:text-white disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                        >
                                            {processing ? (
                                                <>
                                                    <Loader2
                                                        size={15}
                                                        className="animate-spin"
                                                    />
                                                    Recherche…
                                                </>
                                            ) : (
                                                <>
                                                    <Search size={15} />
                                                    Retrouver mon dossier
                                                </>
                                            )}
                                        </button>
                                    </form>

                                    <aside className="space-y-6">
                                        <div className="border-primary/50 bg-primary/5 border-l-2 p-5">
                                            <h2 className="text-foreground text-[15px] font-bold">
                                                Dans quels cas revenir ici ?
                                            </h2>
                                            <ul className="text-muted-foreground mt-3 space-y-2.5 text-[14px] leading-relaxed">
                                                <li>
                                                    Le service de la scolarité a
                                                    déclaré votre dossier
                                                    <strong className="text-foreground">
                                                        {' '}
                                                        à compléter
                                                    </strong>{' '}
                                                    : vous ne redéposez que les
                                                    éléments réclamés.
                                                </li>
                                                <li>
                                                    Votre dossier a été
                                                    <strong className="text-foreground">
                                                        {' '}
                                                        validé
                                                    </strong>{' '}
                                                    et vous devez transmettre
                                                    votre bordereau de versement
                                                    des frais généraux.
                                                </li>
                                                <li>
                                                    Vous souhaitez simplement
                                                    savoir où en est votre
                                                    demande.
                                                </li>
                                            </ul>
                                        </div>

                                        <div className="border-border border p-5">
                                            <h2 className="text-foreground text-[15px] font-bold">
                                                Vous n’avez pas encore déposé de
                                                demande ?
                                            </h2>
                                            <p className="text-muted-foreground mt-2 text-[14px] leading-relaxed">
                                                Le dépôt en ligne se fait depuis
                                                le formulaire de candidature.
                                            </p>
                                            <Link
                                                href={route(
                                                    'candidature.create',
                                                )}
                                                className="text-primary hover:text-foreground mt-3 inline-flex items-center gap-2 text-[14px] font-semibold underline underline-offset-4"
                                            >
                                                Déposer une candidature
                                                <ArrowRight size={14} />
                                            </Link>
                                        </div>
                                    </aside>
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
