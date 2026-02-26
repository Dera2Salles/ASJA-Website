import { PageProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';
import { createContext, useContext } from 'react';
import { LandingProvider } from '../page/landing/bloc/useLandingProvider';
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
import { ThemeProvider } from '../page/theme/useThemeProvider';

// Exported Blog Section to be added to the landing page
import { BlogSection } from './BlogSection';

export interface LandingPageProps extends PageProps {
    componentData: Record<string, Record<string, string>>;
    testimonies: any[];
    blogPosts: any[];
}

export const CmsContext = createContext<LandingPageProps | null>(null);

export const useCms = () => {
    const context = useContext(CmsContext);
    if (!context) throw new Error('useCms must be used within CmsContext.Provider');
    return context;
};

export default function LandingPage(props: LandingPageProps) {
    return (
        <CmsContext.Provider value={props}>
            <Head title="Bienvenue - ASJA" />
            <ThemeProvider>
                <LandingProvider>
                    <div className="flex flex-col overflow-x-hidden">
                        <Navbar />
                        <div className="flex-col items-center justify-center">
                            <Description />
                            <MissionSection />
                            <FiliereSection />
                            <Chatbot />
                            <EvenementSection />
                            <SystemePedagogiqueSection />
                            <TestimonySection />
                            <BlogSection posts={props.blogPosts} />
                            <FaqSection />
                            <Footer />
                        </div>
                    </div>
                </LandingProvider>
            </ThemeProvider>
        </CmsContext.Provider>
    );
}
