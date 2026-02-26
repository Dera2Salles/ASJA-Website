import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';

type Pedag = {
    pourcentage: number;
    title: string;
    description: string;
};

const pedagData: Pedag[] = [
    {
        pourcentage: 45,
        title: 'Cours théoriques',
        description:
            'Acquisition des bases scientifiques et conceptuelles solide de chaque filière.',
    },
    {
        pourcentage: 10,
        title: 'Travaux pratiques',
        description: 'Mise en application concrète des notions vues en cours.',
    },
    {
        pourcentage: 15,
        title: 'Stages et projets',
        description:
            'Immersion dans le monde du travail, projets de terrain et étude de cas réels.',
    },
    {
        pourcentage: 10,
        title: 'Evaluation continue',
        description:
            'Devoirs, présentations, mini-projets et contrôles réguliers.',
    },
    {
        pourcentage: 15,
        title: 'Ouverture et recherche',
        description:
            'Activités de recherche, innovations, conférences, et collaborations externes.',
    },
    {
        pourcentage: 5,
        title: 'Développement personnel',
        description:
            'Formation humaine, éthique et sociale selon les valeurs Déhoniennes.',
    },
];

const PedagCard = ({
    item,
    index,
    percentage,
}: {
    item: Pedag;
    index: number;
    percentage: number;
}) => (
    <motion.div
        initial={{ y: 50, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: index * 0.1, ease: 'easeOut' }}
        viewport={{ once: true }}
        className="h-full transform rounded-2xl bg-white p-8 text-center shadow-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-800"
    >
        <h3 className="pb-4 text-5xl font-bold text-green-700 dark:text-green-500">
            {percentage}%
        </h3>
        <h3 className="pb-2 text-2xl font-bold text-gray-800 dark:text-white">
            {item.title}
        </h3>
        <p className="leading-relaxed text-gray-600 dark:text-gray-300">
            {item.description}
        </p>
    </motion.div>
);

export const SystemePedagogiqueSection = () => {
    const [percentages, setPercentages] = useState<number[]>(
        new Array(pedagData.length).fill(0),
    );
    const [hasAnimated, setHasAnimated] = useState<boolean>(false);
    const animationRef = useRef<boolean>(false);

    const startCounterAnimation = () => {
        if (animationRef.current) return;
        animationRef.current = true;

        const duration = 2000;
        const steps = 60;
        const interval = duration / steps;

        const timers: number[] = [];

        pedagData.forEach((item, index) => {
            let currentStep = 0;
            const targetValue = item.pourcentage;
            const stepSize = targetValue / steps;

            const timer = window.setInterval(() => {
                currentStep++;
                const newValue = Math.min(
                    Math.round(stepSize * currentStep),
                    targetValue,
                );

                setPercentages((prev) => {
                    const newPercentages = [...prev];
                    newPercentages[index] = newValue;
                    return newPercentages;
                });

                if (currentStep >= steps) {
                    window.clearInterval(timer);
                    if (index === pedagData.length - 1) {
                        setHasAnimated(true);
                    }
                }
            }, interval);

            timers.push(timer);
        });

        return () => {
            timers.forEach((timer) => window.clearInterval(timer));
        };
    };

    const observerRef = useIntersectionObserver(
        () => {
            if (!hasAnimated && !animationRef.current) {
                startCounterAnimation();
            }
        },
        {
            threshold: 0.2,
            rootMargin: '50px',
        },
    );

    return (
        <div
            ref={observerRef}
            id="systeme"
            className="bg-gray-50 py-16 transition-all duration-500 md:py-24 dark:bg-zinc-900"
        >
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    viewport={{ amount: 0.2, once: true }}
                    className="mb-12 text-center md:mb-16"
                >
                    <h1 className="text-4xl font-bold text-green-700 transition-all duration-500 md:text-5xl dark:text-green-500">
                        SYSTÈME PÉDAGOGIQUE
                    </h1>
                    <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 transition-all duration-500 dark:text-gray-300">
                        Une approche équilibrée pour une formation complète,
                        alliant théorie solide et pratique immersive.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {pedagData.map((item, index) => (
                        <PedagCard
                            key={index}
                            item={item}
                            index={index}
                            percentage={percentages[index]}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
