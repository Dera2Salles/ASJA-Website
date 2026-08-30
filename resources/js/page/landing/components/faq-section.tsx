import { cmsList, useSection } from '@/lib/cms';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SectionHeading } from './section-heading';

type FaqItem = { question: string; answer: string; category: string };
type FaqCategory = { name: string };

const FaqRow = ({
    item,
    isOpen,
    onToggle,
}: {
    item: FaqItem;
    isOpen: boolean;
    onToggle: () => void;
}) => (
    <div className="border-border border-b last:border-b-0">
        <button
            onClick={onToggle}
            aria-expanded={isOpen}
            className="group flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
        >
            <span
                className={`text-base font-bold md:text-lg ${
                    isOpen
                        ? 'text-primary'
                        : 'text-foreground group-hover:text-primary'
                }`}
            >
                {item.question}
            </span>
            <ChevronDown
                size={20}
                className={`shrink-0 ${
                    isOpen ? 'text-primary rotate-180' : 'text-muted-foreground'
                }`}
            />
        </button>

        <AnimatePresence initial={false}>
            {isOpen ? (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: 'easeInOut' }}
                    className="overflow-hidden"
                >
                    <p className="text-muted-foreground pr-8 pb-5 leading-relaxed">
                        {item.answer}
                    </p>
                </motion.div>
            ) : null}
        </AnimatePresence>
    </div>
);

export const FaqSection = () => {
    const faq = useSection('faq');

    const items = cmsList<FaqItem>(faq.items);
    const categories = cmsList<FaqCategory>(faq.categories);

    // Les catégories réellement utilisées par au moins une question, dans
    // l'ordre défini par le CMS.
    const usableCategories = useMemo(() => {
        const declared = categories.map((c) => c.name).filter(Boolean);
        const used = new Set(items.map((i) => i.category));
        const ordered = declared.filter((name) => used.has(name));
        const extra = [...used].filter(
            (name) => name && !declared.includes(name),
        );
        return [...ordered, ...extra];
    }, [categories, items]);

    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const current = activeCategory ?? usableCategories[0] ?? '';

    const filtered = items.filter((item) => item.category === current);

    const [openQuestion, setOpenQuestion] = useState<string | null>(null);
    const openKey = openQuestion ?? filtered[0]?.question ?? null;

    return (
        <section id="FAQ" className="band-light section border-border border-y">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(faq.eyebrow ?? '')}
                    title={String(faq.title ?? '')}
                    subtitle={String(faq.subtitle ?? '')}
                />

                <div className="mx-auto max-w-3xl">
                    {/* Filtres en pastilles : plus compact et plus lisible que
                        l'ancienne colonne latérale « Catégories ». */}
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {usableCategories.map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setActiveCategory(name);
                                    setOpenQuestion(null);
                                }}
                                className={`cursor-pointer border border-border px-4 py-2 text-sm font-bold uppercase ${
                                    name === current
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    <div className="bg-card border-border border px-6 md:px-8">
                        {filtered.map((item) => (
                            <FaqRow
                                key={item.question}
                                item={item}
                                isOpen={openKey === item.question}
                                onToggle={() =>
                                    setOpenQuestion(
                                        openKey === item.question
                                            ? ''
                                            : item.question,
                                    )
                                }
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
