import ainaImage from '@/assets/Aina-Arthur-quality.jpg';
import michouImage from '@/assets/Bouchet_Michou_Diana.jpeg';
import raoulImage from '@/assets/DADARE-Raoul.jpg';
import faliheryImage from '@/assets/Falihery.jpg';
import miarotianaImage from '@/assets/Mandimbiharison_Miarotiana.jpeg';
import steffyJachiaImage from '@/assets/RAJEMISON-Steffy-Jachia.jpg';
import jenciaImage from '@/assets/RANDRIAMANAPAKA-Manantena-Jencia.jpg';
import suziahImage from '@/assets/Rajemson-suziah-jaida.jpg';
import safidyImage from '@/assets/Safidy-pic.jpg';
import sitrakaImage from '@/assets/Sitraka.jpg';

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { cmsImage, useSection } from '@/lib/cms';
import { usePage } from '@inertiajs/react';
import { Quote } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SectionHeading } from './section-heading';

interface Testimony {
    id: number;
    name: string;
    role: string | null;
    content: string;
    avatar: string | null;
}

/** Photos livrées avec le site, retrouvées par le nom du témoin. */
const fallbackAvatars: Record<string, string> = {
    'Raharijesy Safidy': safidyImage,
    'Randiambolasoa Andriatsilavo Falihery': faliheryImage,
    'Randriamanapaka Manantena Toditsara Jencia': jenciaImage,
    'Bouchet Michou Diana': michouImage,
    'Dadare Raoul': raoulImage,
    'Razanato Nambinintsoa Sitraka': sitrakaImage,
    'Aina Arthur': ainaImage,
    'Mandimbiharison Miarotiana': miarotianaImage,
    'RAJEMISON Steffy Jachia': steffyJachiaImage,
    'RAJEMISON Suziah Jaida': suziahImage,
};

const initials = (name: string) =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase() ?? '')
        .join('');

const TestimonyCard = ({ testimony }: { testimony: Testimony }) => {
    const avatar = cmsImage(testimony.avatar, fallbackAvatars[testimony.name]);

    return (
        <div className="border-border bg-card flex h-full flex-col border p-7">
            <Quote
                className="text-primary mb-4 h-8 w-8 shrink-0"
                aria-hidden="true"
            />

            <p className="text-muted-foreground flex-1 text-sm leading-relaxed">
                {testimony.content}
            </p>

            <div className="border-border mt-6 flex items-center gap-3 border-t pt-5">
                {avatar ? (
                    <img
                        src={avatar}
                        alt=""
                        className="border-border h-11 w-11 shrink-0 border object-cover"
                    />
                ) : (
                    <div className="bg-primary text-primary-foreground border-border flex h-11 w-11 shrink-0 items-center justify-center border text-xs font-bold">
                        {initials(testimony.name)}
                    </div>
                )}

                <div className="min-w-0">
                    <p className="text-foreground truncate text-sm font-semibold">
                        {testimony.name}
                    </p>
                    {testimony.role ? (
                        <p className="text-muted-foreground truncate text-xs">
                            {testimony.role}
                        </p>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export const TestimonySection = () => {
    const content = useSection('testimonials');
    const { testimonies } = usePage().props as unknown as {
        testimonies?: Testimony[];
    };

    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        const handleSelect = () => setCurrent(api.selectedScrollSnap());
        api.on('select', handleSelect);

        return () => {
            api.off('select', handleSelect);
        };
    }, [api]);

    const list = testimonies ?? [];

    if (list.length === 0) return null;

    return (
        <section id="temoignages" className="band-dark section">
            <div className="section-container">
                <SectionHeading
                    eyebrow={String(content.eyebrow ?? '')}
                    title={String(content.title ?? '')}
                    subtitle={String(content.subtitle ?? '')}
                />

                <Carousel
                    setApi={setApi}
                    opts={{ align: 'start', loop: true }}
                    className="w-full"
                >
                    <CarouselContent className="-ml-5">
                        {list.map((testimony) => (
                            <CarouselItem
                                key={testimony.id}
                                className="pl-5 md:basis-1/2 lg:basis-1/3"
                            >
                                <TestimonyCard testimony={testimony} />
                            </CarouselItem>
                        ))}
                    </CarouselContent>

                    <CarouselPrevious className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground border -left-3 hidden md:flex" />
                    <CarouselNext className="border-border bg-card text-foreground hover:bg-accent hover:text-accent-foreground border -right-3 hidden md:flex" />
                </Carousel>

                {count > 1 ? (
                    <div className="mt-8 flex justify-center gap-2">
                        {Array.from({ length: count }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => api?.scrollTo(index)}
                                aria-label={`Aller au témoignage ${index + 1}`}
                                className={`border-border h-2 cursor-pointer border ${
                                    index === current
                                        ? 'bg-primary w-6'
                                        : 'bg-background hover:bg-muted-foreground w-2'
                                }`}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
        </section>
    );
};
