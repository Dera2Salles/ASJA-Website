import { useSection } from '@/lib/cms';
import { formatDate, postImage, type Post } from '@/lib/posts';
import { Link, usePage } from '@inertiajs/react';
import { SectionCarousel } from './section-carousel';

const EventCard = ({ event }: { event: Post }) => {
    const image = postImage(event);
    const dateText = formatDate(event.published_at);

    return (
        <article className="flex h-full">
            <Link
                href={`/actualites/${event.slug}`}
                className="group bg-card hover:bg-accent flex w-full flex-col overflow-hidden rounded-[22px] transition-colors duration-200"
            >
                {image ? (
                    <div
                        className="relative overflow-hidden"
                        style={{ aspectRatio: '16/10' }}
                    >
                        <img
                            src={image}
                            alt=""
                            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                    </div>
                ) : null}

                <div className="flex flex-1 flex-col p-[26px]">
                    {dateText ? (
                        <p className="text-primary m-0 text-[12.5px] font-bold tracking-wider uppercase">
                            {dateText}
                        </p>
                    ) : null}

                    <h3
                        className="font-display text-foreground group-hover:text-primary mt-2.5 font-bold transition-colors"
                        style={{
                            fontSize: '21px',
                            letterSpacing: '-0.015em',
                            lineHeight: '1.2',
                        }}
                    >
                        {event.title}
                    </h3>

                    {event.excerpt ? (
                        <p className="text-muted-foreground mt-2.5 line-clamp-2 text-[14.5px] leading-[1.6]">
                            {event.excerpt}
                        </p>
                    ) : null}
                </div>
            </Link>
        </article>
    );
};

export const EvenementSection = () => {
    const content = useSection('events');
    const { events } = usePage().props as unknown as { events?: Post[] };

    const list = events ?? [];

    if (list.length === 0) return null;

    return (
        <section id="events" className="py-[104px]">
            <div className="mx-auto w-full px-9" style={{ maxWidth: '1320px' }}>
                {/* Carrousel : la grille s'arrêtait aux trois premiers
                    événements, tous sont désormais atteignables. */}
                <SectionCarousel
                    items={list}
                    getKey={(event) => event.id}
                    label="Événements"
                    itemLabel="événement"
                    heading={
                        <h2
                            className="font-display text-foreground m-0 font-black uppercase"
                            style={{
                                fontSize: 'clamp(34px, 4.2vw, 48px)',
                                lineHeight: 1,
                                letterSpacing: '-0.035em',
                            }}
                        >
                            {String(content.title ?? 'Ça bouge')}
                        </h2>
                    }
                    action={
                        <Link
                            href="/actualites"
                            className="text-primary shrink-0 text-sm font-bold hover:underline"
                        >
                            Toutes les actus →
                        </Link>
                    }
                    renderItem={(event) => <EventCard event={event} />}
                />
            </div>
        </section>
    );
};
