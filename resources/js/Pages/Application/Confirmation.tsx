import { CmsProvider, type CmsContent } from '@/lib/cms';
import { Head, Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    CheckCircle2,
    FileText,
    Mail,
    Printer,
} from 'lucide-react';
import { Footer } from '../../page/landing/components/footer';
import { Navbar } from '../../page/landing/components/nav-bar';
import { ThemeProvider } from '../../page/theme/useThemeProvider';

interface Props {
    application: {
        reference: string;
        full_name: string;
        type_label: string;
        level: string;
        mention_name: string;
        email: string;
        status_label: string;
        receipt_sent: boolean;
        documents: { label: string; original_name: string }[];
    };
    cms: CmsContent;
}

const Row = ({ label, value }: { label: string; value: string }) => (
    <div className="border-border flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t py-3.5">
        <dt className="text-muted-foreground text-[12px] font-bold tracking-[0.12em] uppercase">
            {label}
        </dt>
        <dd className="text-foreground text-right text-[15px] font-semibold">
            {value || '—'}
        </dd>
    </div>
);

/**
 * Confirmation du dépôt.
 *
 * Elle n'est atteignable que par le lien signé engendré à la soumission : le
 * numéro de demande seul n'ouvre le dossier de personne. La page redit ce que
 * l'accusé de réception dit par e-mail — le candidat qui n'aurait rien reçu
 * n'est pas laissé sans son numéro.
 */
export default function ApplicationConfirmation({ application, cms }: Props) {
    return (
        <CmsProvider content={cms}>
            <ThemeProvider>
                <Head title={`Demande ${application.reference}`} />

                <div className="square-corners flex min-h-screen flex-col overflow-x-clip">
                    <Navbar />

                    <main className="flex-1">
                        <section className="band-dark pt-14 pb-12 sm:pt-16 sm:pb-14">
                            <div className="section-shell">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.45 }}
                                    className="border-primary text-primary inline-flex size-14 items-center justify-center border-2"
                                >
                                    <CheckCircle2 size={28} />
                                </motion.div>

                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.1 }}
                                    className="font-display text-foreground mt-5 leading-[0.98] font-black tracking-[-0.03em] uppercase"
                                    style={{
                                        fontSize: 'clamp(28px, 6vw, 52px)',
                                    }}
                                >
                                    Demande envoyée avec succès
                                </motion.h1>

                                <motion.p
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.6, delay: 0.18 }}
                                    className="text-muted-foreground mt-4 max-w-2xl text-[15px] leading-relaxed"
                                >
                                    Votre dossier est enregistré et pris en
                                    compte par l’établissement. Conservez votre
                                    numéro de demande : il vous sera demandé au
                                    bureau de la scolarité.
                                </motion.p>
                            </div>
                        </section>

                        <section className="band-light section-rhythm">
                            <div className="section-shell">
                                <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-16">
                                    <div>
                                        {/* Le numéro de demande, mis en avant :
                                            c'est la seule information que le
                                            candidat doit retenir. */}
                                        <div className="border-primary bg-primary/5 border p-6 text-center">
                                            <p className="text-muted-foreground text-[11px] font-bold tracking-[0.16em] uppercase">
                                                Numéro de demande
                                            </p>
                                            <p className="text-foreground mt-2 text-[clamp(26px,6vw,38px)] font-black tracking-[0.04em]">
                                                {application.reference}
                                            </p>
                                        </div>

                                        <dl className="mt-8">
                                            <Row
                                                label="Candidat"
                                                value={application.full_name}
                                            />
                                            <Row
                                                label="Type de demande"
                                                value={application.type_label}
                                            />
                                            <Row
                                                label="Niveau"
                                                value={application.level}
                                            />
                                            <Row
                                                label="Mention"
                                                value={application.mention_name}
                                            />
                                            <Row
                                                label="Adresse e-mail"
                                                value={application.email}
                                            />
                                            <Row
                                                label="Statut du dossier"
                                                value={application.status_label}
                                            />
                                        </dl>

                                        {application.documents.length > 0 && (
                                            <div className="mt-8">
                                                <h2 className="text-muted-foreground text-[12px] font-bold tracking-[0.14em] uppercase">
                                                    Pièces reçues
                                                </h2>
                                                <ul className="mt-3 space-y-2">
                                                    {application.documents.map(
                                                        (document) => (
                                                            <li
                                                                key={
                                                                    document.label
                                                                }
                                                                className="border-border bg-card flex items-center gap-3 border p-3"
                                                            >
                                                                <FileText
                                                                    className="text-muted-foreground size-4 shrink-0"
                                                                    aria-hidden="true"
                                                                />
                                                                <span className="min-w-0">
                                                                    <span className="text-foreground block text-[14px] font-semibold">
                                                                        {
                                                                            document.label
                                                                        }
                                                                    </span>
                                                                    <span className="text-muted-foreground block truncate text-[12.5px]">
                                                                        {
                                                                            document.original_name
                                                                        }
                                                                    </span>
                                                                </span>
                                                            </li>
                                                        ),
                                                    )}
                                                </ul>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        {/* État réel de l'accusé : promettre un
                                            e-mail qui n'est pas parti ferait
                                            attendre le candidat pour rien. */}
                                        {application.receipt_sent ? (
                                            <p className="border-primary/50 bg-primary/5 text-foreground flex items-start gap-3 border-l-2 p-4 text-[14px] leading-relaxed">
                                                <Mail
                                                    size={17}
                                                    className="text-primary mt-0.5 shrink-0"
                                                />
                                                <span>
                                                    Un accusé de réception a été
                                                    envoyé à{' '}
                                                    <strong>
                                                        {application.email}
                                                    </strong>
                                                    . Pensez à vérifier votre
                                                    dossier de courriers
                                                    indésirables.
                                                </span>
                                            </p>
                                        ) : (
                                            <p className="border-destructive/50 bg-destructive/5 text-foreground flex items-start gap-3 border-l-2 p-4 text-[14px] leading-relaxed">
                                                <AlertTriangle
                                                    size={17}
                                                    className="text-destructive mt-0.5 shrink-0"
                                                />
                                                <span>
                                                    Votre demande est bien
                                                    enregistrée, mais l’accusé
                                                    de réception n’a pas pu être
                                                    envoyé à{' '}
                                                    <strong>
                                                        {application.email}
                                                    </strong>
                                                    . Notez votre numéro de
                                                    demande et signalez-le au
                                                    bureau de la scolarité.
                                                </span>
                                            </p>
                                        )}

                                        <div className="border-border bg-card mt-6 border p-6">
                                            <h2 className="font-display text-foreground text-[clamp(20px,3.4vw,26px)] leading-tight font-black uppercase">
                                                Finaliser votre inscription
                                            </h2>

                                            <p className="text-muted-foreground mt-3 text-[14.5px] leading-relaxed">
                                                Le dépôt en ligne ne finalise
                                                pas l’inscription. Vous devez
                                                vous rendre au{' '}
                                                <strong className="text-foreground">
                                                    bureau de la scolarité
                                                </strong>{' '}
                                                afin de finaliser votre
                                                inscription et apporter les
                                                documents originaux ainsi que{' '}
                                                <strong className="text-foreground">
                                                    deux photos d’identité
                                                    identiques au format 4×4, en
                                                    buste
                                                </strong>
                                                .
                                            </p>

                                            <ul className="text-foreground mt-4 space-y-2 text-[14px]">
                                                {[
                                                    'Les documents originaux correspondant aux pièces téléversées',
                                                    'Deux photos d’identité identiques, format 4×4, en buste',
                                                    `Votre numéro de demande : ${application.reference}`,
                                                ].map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-start gap-2.5"
                                                    >
                                                        <span
                                                            className="bg-primary mt-2 size-1.5 shrink-0"
                                                            aria-hidden="true"
                                                        />
                                                        <span className="leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>

                                            <p className="text-muted-foreground mt-5 text-[13.5px] leading-relaxed">
                                                Le service de la scolarité est
                                                ouvert de 8h à 12h et de 13h30 à
                                                15h, à Antsaha.
                                            </p>
                                        </div>

                                        <div className="mt-6 flex flex-wrap gap-2.5">
                                            <button
                                                type="button"
                                                onClick={() => window.print()}
                                                className="border-border text-foreground hover:border-primary hover:text-primary inline-flex min-h-[48px] items-center gap-2 border px-5 text-[14px] font-semibold"
                                            >
                                                <Printer size={15} />
                                                Imprimer cette page
                                            </button>

                                            <Link
                                                href={route('home')}
                                                className="bg-primary text-primary-foreground inline-flex min-h-[48px] items-center px-6 text-[14px] font-bold hover:bg-white hover:text-black"
                                            >
                                                Retour à l’accueil
                                            </Link>
                                        </div>
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
