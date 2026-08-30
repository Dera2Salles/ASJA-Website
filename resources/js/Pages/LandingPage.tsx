import { CmsProvider, type CmsContent } from '@/lib/cms';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import Chatbot from '../page/landing/components/chatbot';
import { Description } from '../page/landing/components/description';
import { EvenementSection } from '../page/landing/components/evenement-section';
import { FaqSection } from '../page/landing/components/faq-section';
import { FiliereSection } from '../page/landing/components/filiere-section';
import { Footer } from '../page/landing/components/footer';
import { MissionSection } from '../page/landing/components/mission-section';
import { Navbar } from '../page/landing/components/nav-bar';
import { SystemePedagogiqueSection } from '../page/landing/components/systeme-pedagogique-section';
import { TestimonySection } from '../page/landing/components/testimony-section';
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
                            <Description />
                            <MissionSection />
                            <FiliereSection />
                            <EvenementSection />
                            <SystemePedagogiqueSection />
                            <TestimonySection />
                            <BlogSection posts={posts} />
                            <FaqSection />
                        </main>
                        <Footer />
                        <Chatbot />
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsProvider>
    );
}
