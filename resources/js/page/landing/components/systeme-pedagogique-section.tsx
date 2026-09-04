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
        className="bg-card hover:bg-accent rounded-[22px] p-6 transition-colors sm:p-8"
    >
        {/* Pourcentage : grand, vert, Archivo */}
        <span className="font-display text-primary text-[46px] leading-none font-black sm:text-[58px]">
            {displayed}%
        </span>

        {/* Barre de proportion */}
        <div
            className="bg-muted mt-5 mb-5 h-1.5 overflow-hidden rounded-full sm:mb-6"
            aria-hidden="true"
        >
            <div
                className="bg-primary h-full rounded-full transition-all duration-100"
                style={{ width: `${displayed}%` }}
            />
        </div>

        <h3 className="text-foreground mb-2 text-lg font-bold sm:text-xl">
            {item.title}
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
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
        <section
            id="systeme"
            ref={observerRef}
            className="band-dark section-rhythm"
        >
            <div className="section-shell">
                {/* En-tête split — le chapô descend sous le titre tant que la
                    rangée ne peut pas accueillir les deux sans les écraser. */}
                <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between sm:gap-12">
                    <h2
                        className="font-display text-foreground max-w-[560px] font-black tracking-tight uppercase"
                        // Le plancher de 40 px faisait sortir « PÉDAGOGIQUE »
                        // du cadre sous 400 px.
                        style={{
                            fontSize: 'clamp(30px, 7.4vw, 56px)',
                            lineHeight: 1.02,
                        }}
                    >
                        {String(pedagogy.title ?? '')}
                    </h2>
                    <p className="text-muted-foreground max-w-sm text-[15px] leading-relaxed sm:text-base">
                        {String(pedagogy.subtitle ?? '')}
                    </p>
                </div>

                {/* Grille de cartes */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
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
