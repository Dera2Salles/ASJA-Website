import { useSection } from '@/lib/cms';
import { formatEventPeriod, postImage, type Post } from '@/lib/posts';
import { Link, usePage } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { CalendarDays, MapPin } from 'lucide-react';
import { SectionHeading } from './section-heading';

const EventCard = ({ event, index }: { event: Post; index: number }) => {
    const image = postImage(event);
    const period = formatEventPeriod(event);

    return (
        <motion.article
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.1, ease: 'easeOut' }}
            className="border-border bg-card group flex flex-col overflow-hidden border"
        >
            {image ? (
                <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                        src={image}
                        alt=""
                        className="h-full w-full object-cover grayscale group-hover:grayscale-0"
                    />
                </div>
            ) : null}

            <div className="flex flex-1 flex-col p-6">
                <div className="text-primary mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
                    {period ? (
                        <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {period}
                        </span>
                    ) : null}
                    {event.location ? (
                        <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                        </span>
                    ) : null}
                </div>

                <h3 className="text-foreground group-hover:text-primary mb-2 text-lg font-bold">
                    <Link href={`/actualites/${event.slug}`}>{event.title}</Link>
                </h3>

                {event.excerpt ? (
                    <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                        {event.excerpt}
                    </p>
                ) : null}
            </div>
        </motion.article>
    );
};

export const EvenementSection = () => {
    const content = useSection('events');
    const { events } = usePage().props as unknown as { events?: Post[] };

    const list = events ?? [];

    // Sans événement publié, la section disparaît plutôt que d'afficher un
    // en-tête suivi du vide.
    if (list.length === 0) return null;

    return (
        <section id="events" className="band-dark section border-border border-y">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(content.eyebrow ?? '')}
                    title={String(content.title ?? '')}
                    subtitle={String(content.subtitle ?? '')}
                />

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {list.map((event, index) => (
                        <EventCard key={event.id} event={event} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};
