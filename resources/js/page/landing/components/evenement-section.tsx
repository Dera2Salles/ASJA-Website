import { motion } from 'framer-motion';
import { CardEventSection } from './card-event';

export const EvenementSection = () => {
    return (
        <div
            id="events"
            className="z-20 w-full border-b-2 border-gray-200 bg-gray-50 transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-900"
        >
            <section className="w-full py-16 md:py-24">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    viewport={{ amount: 0.2, once: true }}
                    className="mb-12 text-center md:mb-16"
                >
                    <h1 className="text-4xl font-bold text-green-700 md:text-5xl dark:text-green-500">
                        NOS ÉVÉNEMENTS
                    </h1>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
                        Découvrez les moments forts qui animent la vie de notre
                        campus.
                    </p>
                </motion.div>
                <CardEventSection />
            </section>
        </div>
    );
};
