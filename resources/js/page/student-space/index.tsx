import { AnimatePresence, motion } from 'framer-motion';
import { useState, type JSX } from 'react';
import { ThemeProvider } from '../theme/useThemeProvider';
import { StudentPortalProvider } from './bloc/useStudentPortalProvider';
import { DocDataTable } from './components/doc-list';
import { NavBar } from './components/nav-bar';
import { PostList } from './components/post-list';
import { StudentInformation } from './components/student-information';

const pageVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
};

const StudentSpaceContent = () => {
    const [index, setIndex] = useState<number>(0);
    const pages: JSX.Element[] = [
        <PostList />,
        <DocDataTable />,
        <StudentInformation />,
    ];

    return (
        <div className="h-screen w-full overflow-hidden bg-white text-gray-800 dark:bg-zinc-900 dark:text-white">
            <NavBar callBack={setIndex} index={index} />
            <main className="h-full w-full px-4 pt-24 pb-24 md:pb-8">
                {}
                <section className="hidden h-full w-full gap-6 md:grid md:grid-cols-[1fr_1.5fr_1fr]">
                    <StudentInformation />
                    <PostList />
                    <DocDataTable />
                </section>

                {}
                <section className="h-full w-full md:hidden">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={index}
                            variants={pageVariants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="h-full w-full"
                        >
                            {pages[index]}
                        </motion.div>
                    </AnimatePresence>
                </section>
            </main>
        </div>
    );
};

export const StudentSpacePage = () => {
    return (
        <StudentPortalProvider>
            <ThemeProvider>
                <StudentSpaceContent />
            </ThemeProvider>
        </StudentPortalProvider>
    );
};
