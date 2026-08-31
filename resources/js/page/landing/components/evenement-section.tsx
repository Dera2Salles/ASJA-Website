import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';

const EventCard = ({ event, index }: { event: Post; index: number }) => {
    const image = postImage(event);
    const dateText = formatDate(event.published_at);

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
            className="flex"
        >
            <Link
                href={`/actualites/${event.slug}`}
                className="group flex flex-col overflow-hidden rounded-[22px] bg-card hover:bg-accent transition-colors duration-200 w-full"
            >
                {image ? (
                    <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ) : null}

                <div className="flex flex-1 flex-col p-[26px]">
                    {dateText ? (
                        <p className="m-0 text-[12.5px] font-bold text-primary uppercase tracking-wider">
                            {dateText}
                        </p>
                    ) : null}

                    <h3
                        className="font-display font-bold text-foreground mt-2.5 transition-colors group-hover:text-primary"
                        style={{ fontSize: '21px', letterSpacing: '-0.015em', lineHeight: '1.2' }}
                    >
                        {event.title}
                    </h3>

                    {event.excerpt ? (
                        <p className="mt-2.5 line-clamp-2 text-[14.5px] leading-[1.6] text-muted-foreground">
                            {event.excerpt}
                        </p>
                    ) : null}
                </div>
            </Link>
        </motion.article>
    );
};

export const EvenementSection = () => {
    const content = useSection('events');
    const { events } = usePage().props as unknown as { events?: Post[] };

    const list = events ?? [];

    if (list.length === 0) return null;

    return (
        <section
            id="events"
            className="py-[104px]"
            style={{ borderTop: '1px solid var(--border)' }}
        >
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* En-tête */}
                <div className="mb-10 flex items-end justify-between gap-10">
                    <h2
                        className="font-display font-black uppercase text-foreground m-0"
                        style={{
                            fontSize: '48px',
                            lineHeight: 1,
                            letterSpacing: '-0.035em',
                        }}
                    >
                        {String(content.title ?? 'Ça bouge')}
                    </h2>
                    <Link
                        href="/actualites"
                        className="shrink-0 text-sm font-bold text-primary hover:underline"
                    >
                        Toutes les actus →
                    </Link>
                </div>

                {/* Grille 3 colonnes comme le design */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {list.slice(0, 3).map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
