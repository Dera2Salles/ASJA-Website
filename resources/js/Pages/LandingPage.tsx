import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import { Description } from '../page/landing/components/description';
import { MarqueeBand } from '../page/landing/components/marquee-band';
import { EvenementSection } from '../page/landing/components/evenement-section';
import { FaqSection } from '../page/landing/components/faq-section';
import { FiliereSection } from '../page/landing/components/filiere-section';
import { Footer } from '../page/landing/components/footer';
import { MissionSection } from '../page/landing/components/mission-section';
import { Navbar } from '../page/landing/components/nav-bar';
import { SystemePedagogiqueSection } from '../page/landing/components/systeme-pedagogique-section';
import { TestimonySection } from '../page/landing/components/testimony-section';
import { AppelCandidaterSection } from '../page/landing/components/appel-candidater-section';
import { LandingProvider } from '../page/landing/bloc/useLandingProvider';
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

export default function LandingPage({ cms, posts }: LandingPageProps) {
    return (
        <CmsProvider content={cms}>
            <Head title="Accueil" />
            <ThemeProvider>
                <LandingProvider>
                    <div className="flex min-h-screen flex-col overflow-x-hidden">
                        <Navbar />
                        <main className="flex-1">
                            {/* Section 1: Hero Description (Sombre par défaut - Image) */}
                            <Description />
                            
                            {/* Bandeau de transition Marquee Vert */}
                            <MarqueeBand />
                            
                            {/* Section 2: Campus (Claire - Stats & photos) */}
                            <MissionSection />
                            
                            {/* Section 3: Mentions / Filieres (Sombre) */}
                            <FiliereSection />
                            
                            {/* Section 4: Événements (Sombre -> On le passe en clair pour alterner) */}
                            <div className="band-light">
                                <EvenementSection />
                            </div>
                            
                            {/* Section 5: Méthode / Système Pédagogique (Sombre) */}
                            <SystemePedagogiqueSection />
                            
                            {/* Section 6: Témoignages (Sombre -> On le passe en clair pour alterner) */}
                            <div className="band-light">
                                <TestimonySection />
                            </div>
                            
                            {/* Section 7: Actualités / Blog (Sombre) */}
                            <BlogSection posts={posts} />
                            
                            {/* Section 8: FAQ (Sombre -> On la passe en clair pour alterner) */}
                            <div className="band-light">
                                <FaqSection />
                            </div>
                            
                            {/* Section 9: Appel Candidature (Sombre - Boîte Verte) */}
                            <AppelCandidaterSection />
                        </main>
                        <Footer />
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsProvider>
    );
}
