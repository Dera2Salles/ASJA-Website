import campus from '@/assets/Lieu_espace/Devant_asja.jpg';
import Logo from '@/assets/Logo/asja-logo.png';
import { Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import { PropsWithChildren } from 'react';

/**
 * Écrans d'authentification — même langage que la page d'accueil : photo de
 * campus voilée de vert forêt à gauche, titre Archivo massif, formulaire posé
 * sur une surface claire à droite. `app-shell` apporte les arrondis généreux
 * et les pilules (il neutralise la remise à zéro brutaliste du site public).
 */
export default function Guest({ children }: PropsWithChildren) {
    return (
        <div className="app-shell grid min-h-screen lg:grid-cols-[1.05fr_1fr]">
            {/* Volet photo : seul aplat sombre de l'écran. */}
            <aside className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
                <img
                    src={campus}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                    className="absolute inset-0"
                    aria-hidden="true"
                    style={{
                        background:
                            'linear-gradient(180deg, rgba(20,27,23,0.55) 0%, rgba(20,27,23,0.72) 45%, rgba(20,27,23,0.96) 100%)',
                    }}
                />

                <div className="relative z-10 p-10">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-3"
                        aria-label="Retour à l'accueil"
                    >
                        <img
                            src={Logo}
                            alt=""
                            className="size-11 rounded-[10px] object-contain"
                        />
                        <span className="font-display text-[18px] font-black tracking-[-0.02em] text-white uppercase">
                            Université ASJA
                        </span>
                    </Link>
                </div>

                <div className="relative z-10 p-10">
                    <span className="bg-primary text-primary-foreground inline-flex items-center rounded-full px-4 py-2 text-[11px] font-bold tracking-wide uppercase">
                        Espace étudiant &amp; administration
                    </span>

                    <h2
                        className="font-display mt-6 max-w-[520px] leading-[0.95] font-black tracking-[-0.04em] text-white uppercase"
                        style={{ fontSize: 'clamp(38px, 4vw, 58px)' }}
                    >
                        Votre campus,
                        <br />
                        <span className="text-primary">en ligne</span>
                    </h2>

                    <p
                        className="mt-5 max-w-[420px] text-[15px] leading-relaxed"
                        style={{ color: '#c3cec8' }}
                    >
                        Emploi du temps, documents, annonces et événements :
                        tout se retrouve derrière une seule connexion.
                    </p>
                </div>
            </aside>

            {/* Volet formulaire : surface claire. */}
            <main className="bg-background flex flex-col items-center justify-center px-5 py-12 sm:px-10">
                <div className="w-full max-w-[440px]">
                    {/* En-tête compact, uniquement là où le volet photo est
                        masqué. */}
                    <Link
                        href="/"
                        className="mb-10 inline-flex items-center gap-3 lg:hidden"
                    >
                        <img
                            src={Logo}
                            alt=""
                            className="size-10 rounded-[10px] object-contain"
                        />
                        <span className="font-display text-foreground text-[17px] font-black tracking-[-0.02em] uppercase">
                            Université ASJA
                        </span>
                    </Link>

                    {children}

                    <div className="border-border mt-10 flex items-center justify-between gap-4 border-t pt-6">
                        <Link
                            href="/"
                            className="text-muted-foreground hover:text-primary inline-flex items-center gap-2 text-[12.5px] font-semibold"
                        >
                            <ArrowLeft className="size-3.5" />
                            Retour au site
                        </Link>
                        <span className="text-muted-foreground text-[11px] font-semibold tracking-[0.14em] uppercase">
                            © {new Date().getFullYear()} ASJA
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}
