import { motion } from 'framer-motion';

/**
 * En-tête commun à toutes les sections de la landing.
 * Centralisé pour que le rythme et la hiérarchie typographique restent
 * identiques d'une section à l'autre — c'était l'une des principales causes
 * d'incohérence visuelle du site.
 */
export const SectionHeading = ({
    eyebrow,
    title,
    subtitle,
    align = 'center',
}: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    align?: 'center' | 'left';
}) => (
    <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ amount: 0.3, once: true }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className={
            align === 'center'
                ? 'mx-auto mb-14 max-w-2xl text-center md:mb-16'
                : 'mb-14 max-w-2xl md:mb-16'
        }
    >
        {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
        <h2 className="text-foreground text-3xl md:text-4xl lg:text-[2.75rem]">
            {title}
        </h2>
        {subtitle ? (
            <p className="text-muted-foreground mt-4 text-base leading-relaxed md:text-lg">
                {subtitle}
            </p>
        ) : null}
    </motion.div>
);
