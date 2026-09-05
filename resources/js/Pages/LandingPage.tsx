import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import { LandingProvider } from '../page/landing/bloc/useLandingProvider';
import { AppelCandidaterSection } from '../page/landing/components/appel-candidater-section';
import { BandTransition } from '../page/landing/components/band-transition';
import { CampusSection } from '../page/landing/components/campus-section';
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
                    {/* `clip` et non `hidden` : `overflow-x: hidden` fait de
                        cette enveloppe un conteneur de défilement, ce qui
                        décrochait la navbar `sticky` dès le premier scroll.
                        `clip` rogne le débordement horizontal sans créer de
                        scrollport, la barre reste donc épinglée. */}
                    <div className="flex min-h-screen flex-col overflow-x-clip">
                        <Navbar />
                        <main className="flex-1">
                            {/* 1. Hero (sombre — photo pleine page) */}
                            <Description />

                            {/* Bandeau de transition Marquee Vert */}
                            <MarqueeBand />

                            {/* 2. Mission & objectifs (sombre) — le marquee
                                vert fait déjà rupture avec le hero, le fondu
                                ne commence qu'après. */}
                            <MissionSection />

                            <BandTransition direction="dark-to-light" />

                            {/* 3. Campus (clair) */}
                            <CampusSection />

                            <BandTransition direction="light-to-dark" />

                            {/* 4. Mentions / Filières (sombre) */}
                            <FiliereSection />

                            <BandTransition direction="dark-to-light" />

                            {/* 5. Événements (clair) */}
                            <div className="band-light">
                                <EvenementSection />
                            </div>

                            <BandTransition direction="light-to-dark" />

                            {/* 6. Méthode / Système pédagogique (sombre) */}
                            <SystemePedagogiqueSection />

                            <BandTransition direction="dark-to-light" />

                            {/* 7. Témoignages (clair) */}
                            <div className="band-light">
                                <TestimonySection />
                            </div>

                            <BandTransition direction="light-to-dark" />

                            {/* 8. Actualités / Blog (sombre) */}
                            <BlogSection posts={posts} />

                            {/* 9. FAQ (sombre) */}
                            <FaqSection />

                            {/* 10. Appel à candidature (sombre — boîte verte) */}
                            <AppelCandidaterSection />
                        </main>
                        <Footer />
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsProvider>
    );
}
