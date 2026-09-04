import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import { LandingProvider } from '../page/landing/bloc/useLandingProvider';
import { AppelCandidaterSection } from '../page/landing/components/appel-candidater-section';
import { BandTransition } from '../page/landing/components/band-transition';
import { Description } from '../page/landing/components/description';
import { EvenementSection } from '../page/landing/components/evenement-section';
import { FaqSection } from '../page/landing/components/faq-section';
import { FiliereSection } from '../page/landing/components/filiere-section';
import { Footer } from '../page/landing/components/footer';
import { MarqueeBand } from '../page/landing/components/marquee-band';
import { MissionSection } from '../page/landing/components/mission-section';
import { Navbar } from '../page/landing/components/nav-bar';
import { SystemePedagogiqueSection } from '../page/landing/components/systeme-pedagogique-section';
import { TestimonySection } from '../page/landing/components/testimony-section';
import { ThemeProvider } from '../page/theme/useThemeProvider';
import { BlogSection } from './BlogSection';

export interface LandingPageProps {
    cms: CmsContent;
    testimonies: unknown[];
    departments: unknown[];
    posts: Post[];
    events: Post[];
    announcements: Post[];
}

/**
 * La page alterne toujours les mêmes deux aplats — `band-dark` et `band-light`
 * — mais les frontières ne sont plus des arêtes : un `BandTransition` occupe
 * chaque passage de l'un à l'autre et étale le fondu sur la hauteur d'un
 * scroll. Le texte, lui, reste toujours à l'intérieur d'une bande pleine :
 * aucun titre ne se retrouve posé sur le dégradé, donc aucun ne peut virer au
 * blanc sur blanc pendant le fondu.
 */
export default function LandingPage({ cms, posts }: LandingPageProps) {
    return (
        <CmsProvider content={cms}>
            <Head title="Accueil" />
            <ThemeProvider>
                <LandingProvider>
                    <div className="flex min-h-screen flex-col overflow-x-hidden">
                        <Navbar />
                        <main className="flex-1">
                            {/* 1. Hero (sombre — photo pleine page) */}
                            <Description />

                            {/* Bandeau de transition Marquee Vert */}
                            <MarqueeBand />

                            {/* 2. Campus (clair) — le marquee vert fait déjà
                                rupture, le fondu commence après. */}
                            <MissionSection />

                            <BandTransition direction="light-to-dark" />

                            {/* 3. Mentions / Filières (sombre) */}
                            <FiliereSection />

                            <BandTransition direction="dark-to-light" />

                            {/* 4. Événements (clair) */}
                            <div className="band-light">
                                <EvenementSection />
                            </div>

                            <BandTransition direction="light-to-dark" />

                            {/* 5. Méthode / Système pédagogique (sombre) */}
                            <SystemePedagogiqueSection />

                            <BandTransition direction="dark-to-light" />

                            {/* 6. Témoignages (clair) */}
                            <div className="band-light">
                                <TestimonySection />
                            </div>

                            <BandTransition direction="light-to-dark" />

                            {/* 7. Actualités / Blog (sombre) */}
                            <BlogSection posts={posts} />

                            {/* 8. FAQ (sombre) */}
                            <FaqSection />

                            {/* 9. Appel à candidature (sombre — boîte verte) */}
                            <AppelCandidaterSection />
                        </main>
                        <Footer />
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsProvider>
    );
}
