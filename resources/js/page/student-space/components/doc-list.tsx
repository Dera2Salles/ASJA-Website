import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnimatePresence, easeInOut, motion } from 'framer-motion';
import { Download, FileText } from 'lucide-react';
import { useStudentPortalContext } from '../bloc/useStudentSpaceContext';
import { useDocTable } from '../hooks/useDocFileTable';
import { DocListSkeleton } from './doc-list-skeleton';

const docVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
        opacity: 1,
        x: 0,
        transition: {
            delay: i * 0.1,
            duration: 0.5,
            ease: easeInOut,
        },
    }),
};

export const DocDataTable = () => {
    const { observerRef, table } = useDocTable();
    const { isLoading } = useStudentPortalContext();

    if (isLoading) {
        return <DocListSkeleton />;
    }

    return (
        <Card className="h-full w-full rounded-2xl border-0 bg-white/10 p-1 backdrop-blur-lg md:p-4 dark:bg-black/20">
            <div className="p-4">
                <h2 className="mb-4 text-2xl font-bold text-black drop-shadow-lg dark:text-gray-200">
                    Liste des documents
                </h2>
                <ScrollArea className="h-[calc(100vh-250px)] pr-4">
                    <div className="space-y-3">
                        <AnimatePresence>
                            {table.getRowModel().rows?.length ? (
                                table.getRowModel().rows.map((row, i) => (
                                    <motion.div
                                        key={row.id}
                                        custom={i}
                                        initial="hidden"
                                        animate="visible"
                                        variants={docVariants}
                                        className="flex items-center justify-between rounded-lg bg-white/10 p-3 transition-colors duration-300 hover:bg-white/20"
                                    >
                                        <div className="flex items-center gap-4">
                                            <FileText className="size-6 text-green-400" />
                                            <div className="text-white">
                                                <p className="font-semibold">
                                                    {row.original.lessonTitle}
                                                </p>
                                                <p className="text-sm text-black dark:text-gray-200">
                                                    {row.original.author}
                                                </p>
                                            </div>
                                        </div>
                                        <a
                                            href={row.original.fileUrl}
                                            download
                                            className="rounded-full p-2 text-green-400 transition-colors hover:bg-green-500/20"
                                            aria-label={`Download ${row.original.lessonTitle}`}
                                        >
                                            <Download className="size-5" />
                                        </a>
                                    </motion.div>
                                ))
                            ) : (
                                <div className="py-10 text-center text-black dark:text-gray-200">
                                    <p>Aucun document pour l'instant.</p>
                                </div>
                            )}
                        </AnimatePresence>
                        <div ref={observerRef} className="h-1" />
                    </div>
                </ScrollArea>
            </div>
        </Card>
    );
};
