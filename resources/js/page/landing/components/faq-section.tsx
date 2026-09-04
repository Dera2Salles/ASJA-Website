import { cmsList, useSection } from '@/lib/cms';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { useMemo, useState } from 'react';

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
                className={`shrink-0 transition-transform ${
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
                    <p className="text-muted-foreground pr-8 pb-5 text-sm leading-relaxed">
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
        <section id="FAQ" className="band-dark section-rhythm">
            <div className="section-shell">
                {/* Header */}
                <div className="mb-10 text-center sm:mb-12">
                    <h2
                        className="font-display text-foreground font-black uppercase"
                        style={{
                            fontSize: 'clamp(30px, 7.4vw, 56px)',
                            lineHeight: 1.02,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        {String(faq.title ?? 'Des questions ?')}
                    </h2>
                    {faq.subtitle ? (
                        <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-[15px] leading-relaxed sm:text-base">
                            {String(faq.subtitle)}
                        </p>
                    ) : null}
                </div>

                <div className="mx-auto max-w-3xl">
                    {/* Filtres en pastilles de style pilule arrondi */}
                    <div className="mb-7 flex flex-wrap justify-center gap-2 sm:mb-8">
                        {usableCategories.map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setActiveCategory(name);
                                    setOpenQuestion(null);
                                }}
                                className={`inline-flex min-h-[40px] cursor-pointer items-center rounded-full px-5 text-xs font-bold uppercase transition-colors ${
                                    name === current
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border-border border'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    {/* Conteneur FAQ arrondi */}
                    <div className="bg-card border-border rounded-[22px] border px-5 sm:px-6 md:px-8">
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
