import { cmsList, useSection } from '@/lib/cms';
import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

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
        className="rounded-[22px] bg-card p-8 transition-colors hover:bg-accent"
    >
        {/* Pourcentage : grand, vert, Archivo */}
        <span className="font-display text-[58px] font-black leading-none text-primary">
            {displayed}%
        </span>

        {/* Barre de proportion */}
        <div
            className="mb-6 mt-5 h-1.5 overflow-hidden rounded-full bg-muted"
            aria-hidden="true"
        >
            <div
                className="h-full rounded-full bg-primary transition-all duration-100"
                style={{ width: `${displayed}%` }}
            />
        </div>

        <h3 className="mb-2 text-xl font-bold text-foreground">{item.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
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
        <section id="systeme" ref={observerRef} className="band-dark py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* En-tête split */}
                <div className="mb-12 flex items-end justify-between gap-12">
                    <h2
                        className="max-w-[560px] font-display font-black uppercase tracking-tight text-foreground"
                        style={{
                            fontSize: 'clamp(40px, 4vw, 56px)',
                            lineHeight: 1,
                        }}
                    >
                        {String(pedagogy.title ?? '')}
                    </h2>
                    <p className="max-w-sm text-base leading-relaxed text-muted-foreground">
                        {String(pedagogy.subtitle ?? '')}
                    </p>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
