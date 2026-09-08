import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import { LandingProvider } from '../page/landing/bloc/useLandingProvider';
import { AppelCandidaterSection } from '../page/landing/components/appel-candidater-section';
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
 * Page d'accueil en full light mode : un seul aplat blanc sur toutes les
 * sections, sans alternance sombre/clair ni transition dégradée. Chaque
 * section garde sa mise en page, seul le fond est unifié.
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
                    <div className="square-corners band-light flex min-h-screen flex-col overflow-x-clip">
                        <Navbar />
                        <main className="band-light flex-1">
                            {/* 1. Hero (photo pleine page) */}
                            <Description />

                            {/* Bandeau de transition Marquee Vert */}
                            <MarqueeBand />

                            {/* 2. Mission & objectifs */}
                            <MissionSection />

                            {/* 3. Campus */}
                            <CampusSection />

                            {/* 4. Mentions / Filières */}
                            <FiliereSection />

                            {/* 5. Événements */}
                            <div className="band-light">
                                <EvenementSection />
                            </div>

                            {/* 6. Méthode / Système pédagogique */}
                            <SystemePedagogiqueSection />

                            {/* 7. Témoignages */}
                            <div className="band-light">
                                <TestimonySection />
                            </div>

                            {/* 8. Actualités / Blog */}
                            <div className="band-light">
                                <BlogSection posts={posts} />
                            </div>

                            {/* 9. FAQ */}
                            <FaqSection />

                            {/* 10. Appel à candidature (boîte verte) */}
                            <AppelCandidaterSection />
                        </main>
                        <Footer />
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsProvider>
    );
}
