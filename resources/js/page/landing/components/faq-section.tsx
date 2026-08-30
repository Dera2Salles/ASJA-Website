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
                    <p className="text-muted-foreground pr-8 pb-5 leading-relaxed text-sm">
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
        <section id="FAQ" className="band-dark py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                
                {/* Header */}
                <div className="mb-12 text-center">
                    <h2
                        className="font-display font-black uppercase text-foreground"
                        style={{
                            fontSize: 'clamp(40px, 4vw, 56px)',
                            lineHeight: 1,
                            letterSpacing: '-0.04em',
                        }}
                    >
                        {String(faq.title ?? 'Des questions ?')}
                    </h2>
                    {faq.subtitle ? (
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground mx-auto max-w-2xl">
                            {String(faq.subtitle)}
                        </p>
                    ) : null}
                </div>

                <div className="mx-auto max-w-3xl">
                    {/* Filtres en pastilles de style pilule arrondi */}
                    <div className="mb-8 flex flex-wrap justify-center gap-2">
                        {usableCategories.map((name) => (
                            <button
                                key={name}
                                onClick={() => {
                                    setActiveCategory(name);
                                    setOpenQuestion(null);
                                }}
                                className={`cursor-pointer rounded-full px-5 py-2 text-xs font-bold uppercase transition-colors ${
                                    name === current
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground border border-border'
                                }`}
                            >
                                {name}
                            </button>
                        ))}
                    </div>

                    {/* Conteneur FAQ arrondi */}
                    <div className="bg-card rounded-[22px] px-6 md:px-8 border border-border">
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
