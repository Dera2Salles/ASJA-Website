import { cmsList, useSection } from '@/lib/cms';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { SectionHeading } from './section-heading';

type PedagItem = {
    percentage: number | string;
    title: string;
    description: string;
};

const PedagCard = ({
    item,
    index,
    displayed,
}: {
    item: PedagItem;
    index: number;
    displayed: number;
}) => (
    <motion.div
        initial={{ y: 32, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.5, delay: index * 0.08, ease: 'easeOut' }}
        className="border-border bg-card hover:bg-primary group h-full border p-7"
    >
        {/* Barre de proportion : rend le pourcentage lisible d'un coup d'œil,
            là où le chiffre seul demandait un effort de comparaison. */}
        <div className="mb-5 flex items-baseline gap-2">
            <span className="text-primary group-hover:text-primary-foreground font-display text-4xl font-extrabold">
                {displayed}
            </span>
            <span className="text-primary group-hover:text-primary-foreground text-lg font-semibold">%</span>
        </div>

        <div
            className="bg-background border-border mb-6 h-2 w-full overflow-hidden border"
            aria-hidden="true"
        >
            <div
                className="bg-foreground group-hover:bg-primary-foreground h-full"
                style={{ width: `${displayed}%` }}
            />
        </div>

        <h3 className="text-foreground group-hover:text-primary-foreground mb-2 text-lg font-bold">{item.title}</h3>
        <p className="text-muted-foreground group-hover:text-primary-foreground text-sm leading-relaxed">
            {item.description}
        </p>
    </motion.div>
);

export const SystemePedagogiqueSection = () => {
    const pedagogy = useSection('pedagogy');
    const items = cmsList<PedagItem>(pedagogy.items);

    const [displayed, setDisplayed] = useState<number[]>([]);
    const started = useRef(false);

    const targets = items.map((item) => Number(item.percentage) || 0);
    const values = targets.map((_, i) => displayed[i] ?? 0);

    const startAnimation = () => {
        if (started.current || targets.length === 0) return;
        started.current = true;

        const steps = 60;
        const interval = 2000 / steps;
        let step = 0;

        const timer = window.setInterval(() => {
            step++;
            const ratio = Math.min(step / steps, 1);
            setDisplayed(targets.map((t) => Math.round(t * ratio)));

            if (step >= steps) window.clearInterval(timer);
        }, interval);
    };

    const observerRef = useIntersectionObserver(startAnimation, {
        threshold: 0.2,
        rootMargin: '50px',
    });

    return (
        <section id="systeme" ref={observerRef} className="band-light section">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(pedagogy.eyebrow ?? '')}
                    title={String(pedagogy.title ?? '')}
                    subtitle={String(pedagogy.subtitle ?? '')}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, index) => (
                        <PedagCard
                            key={`${item.title}-${index}`}
                            item={item}
                            index={index}
                            displayed={values[index]}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
