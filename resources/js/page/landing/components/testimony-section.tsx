import { Card, CardContent } from '@/components/ui/card';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
    type CarouselApi,
} from '@/components/ui/carousel';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

import ainaImage from '@/assets/Aina-Arthur-quality.jpg';
import Michou from '@/assets/Bouchet_Michou_Diana.jpeg';
import Raoul from '@/assets/DADARE-Raoul.jpg';
import Falihery from '@/assets/Falihery.jpg';
import Miarotiana from '@/assets/Mandimbiharison_Miarotiana.jpeg';
import RAJEMISON from '@/assets/RAJEMISON-Steffy-Jachia.jpg';
import steffy from '@/assets/Rajemson-suziah-jaida.jpg';
import genciaImage from '@/assets/RANDRIAMANAPAKA-Manantena-Jencia.jpg';
import safidyImage from '@/assets/Safidy-pic.jpg';
import Sitraka from '@/assets/Sitraka.jpg';

type Temoin = {
    name: string;
    status?: string;
    description: string;
    image?: string;
};

const temoignages: Temoin[] = [
    {
        name: 'Raharijesy Safidy',
        status: 'UI/UX Designer',
        description:
            "Mon parcours, de la formation en informatique à la spécialisation en UI/UX Design, m'a doté de l'expertise technique et de la vision créative nécessaires pour aujourd'hui, en tant qu'entrepreneur, aider les marques à s'exprimer pleinement.",
        image: safidyImage,
    },
    {
        name: 'Randiambolasoa Andriatsilavo Falihery',
        status: 'Étudiant en Génie Industriel',
        description:
            'La formation en Génie Industriel à l’ASJA a profondément transformé ma manière d’aborder les systèmes techniques et organisationnels. Grâce aux cours orientés vers la pratique, j’ai appris à analyser, optimiser et améliorer des processus industriels réels.',
        image: Falihery,
    },
    {
        name: 'Randriamanapaka Manantena Toditsara Jencia',
        status: 'Étudiante en Droit',
        description:
            'Étudiante en Master 1 de Droit à l’ASJA et Présidente de la Mention Droit, j’ai pu renforcer mon leadership et mon dynamisme grâce aux opportunités offertes par l’université, notamment un stage au Ministère des affaires étrangères et au ministère de la fonction publique dès ma 2ᵉ année.',
        image: genciaImage,
    },
    {
        name: 'Bouchet Michou Diana',
        status: 'Étudiante en Science de la Terre',
        description:
            "Mes études à l'ASJA m'ont permis d'explorer ma passion pour les sciences de la terre. Les cours pratiques et les sorties sur le terrain ont enrichi ma compréhension des enjeux environnementaux et géologiques.",
        image: Michou,
    },
    {
        name: 'Dadare Raoul',
        status: 'Étudiant en Langue Étrangère Appliquée',
        description:
            "Ma formation en Langue Étrangère Appliquée à l'ASJA m'a ouvert les portes du monde professionnel international. J'ai développé des compétences linguistiques et interculturelles essentielles pour préparer ma carrière.",
        image: Raoul,
    },
    {
        name: 'Razanato Nambinintsoa Sitraka',
        status: 'Ingénieure Agronome',
        description:
            "Mes études à l'ASJA ont confirmé que l'Agronomie ne se limite pas juste à cultiver, mais englobe aussi le commerce, la gestion, le marketing, la qualité et l'environnement.",
        image: Sitraka,
    },
    {
        name: 'Aina Arthur',
        status: 'Sortant en Droit Processuel',
        description:
            "L'ASJA m'a aidé à trouver mon parcours professionnel. Les cours de droit ont été particulièrement pertinents et m'ont permis de me perfectionner et de prendre confiance en mes capacités.",
        image: ainaImage,
    },
    {
        name: 'Mandimbiharison Miarotiana',
        status: 'Étudiant en Économie',
        description:
            'Mon parcours en Économie au sein de l’ASJA a été une expérience déterminante. En Master 2, j’ai pu approfondir des compétences essentielles comme l’analyse des politiques économiques, la gestion des ressources et l’étude des dynamiques de marché.',
        image: Miarotiana,
    },
    {
        name: 'RAJEMISON Steffy Jachia',
        status: 'Étudiante en Économie',
        description:
            'L’ASJA m’a offert un cadre stimulant qui a renforcé mon ambition. Je suis prête à relever les défis du monde des affaires.',
        image: RAJEMISON,
    },
    {
        name: 'RAJEMISON Suziah Jaida',
        status: 'Étudiante en Économie',
        description:
            "Mes études en économie à l'ASJA m'ont permis d'acquérir une compréhension approfondie des principes économiques et des marchés, me préparant ainsi à une carrière réussie dans la finance ou la gestion.",
        image: steffy,
    },
];

export const TestimonySection = () => {
    const [api, setApi] = useState<CarouselApi>();
    const [current, setCurrent] = useState(0);
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!api) return;

        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap());

        const handleSelect = () => {
            setCurrent(api.selectedScrollSnap());
        };

        api.on('select', handleSelect);

        return () => {
            api.off('select', handleSelect);
        };
    }, [api]);

    return (
        <section
            id="temoignages"
            className="bg-gray-50 py-20 transition-all duration-500 sm:py-28 dark:bg-zinc-900"
        >
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true, amount: 0.3 }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-4xl font-bold text-green-700 md:text-5xl dark:text-green-500">
                        Témoignages
                    </h2>
                    <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600 transition-all duration-500 dark:text-gray-300">
                        Découvrez les parcours inspirants et les réussites de
                        nos diplômés.
                    </p>
                </motion.div>

                <Carousel
                    setApi={setApi}
                    opts={{ align: 'start', loop: true }}
                    className="mx-auto w-full max-w-6xl"
                >
                    <CarouselContent className="-ml-4">
                        {temoignages.map((temoin, index) => (
                            <CarouselItem
                                key={index}
                                className="pl-4 md:basis-1/2 lg:basis-1/3"
                            >
                                <div className="h-full p-1">
                                    <Card className="flex h-full transform flex-col overflow-hidden rounded-xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl dark:bg-zinc-800">
                                        <CardContent className="flex flex-grow flex-col items-center p-8 text-center">
                                            <img
                                                className="mb-5 h-32 w-32 rounded-full border-4 border-white object-cover shadow-md transition-all duration-500 dark:border-zinc-700"
                                                src={temoin.image}
                                                alt={`Photo de ${temoin.name}`}
                                                width={128}
                                                height={128}
                                            />
                                            <h3 className="text-xl font-bold text-gray-900 transition-all duration-500 dark:text-white">
                                                {temoin.name}
                                            </h3>
                                            <p className="mb-4 text-sm font-medium text-green-600 transition-all duration-500 dark:text-green-400">
                                                {temoin.status}
                                            </p>
                                            <blockquote className="flex-grow text-base leading-relaxed text-gray-600 italic transition-all duration-500 dark:text-gray-300">
                                                <span className="mr-1 text-4xl leading-none text-gray-300 transition-all duration-500 dark:text-gray-600">
                                                    “
                                                </span>
                                                {temoin.description}
                                                <span className="ml-1 text-4xl leading-none text-gray-300 transition-all duration-500 dark:text-gray-600">
                                                    ”
                                                </span>
                                            </blockquote>
                                        </CardContent>
                                    </Card>
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                    <CarouselPrevious className="hidden sm:flex" />
                    <CarouselNext className="hidden sm:flex" />
                </Carousel>

                <div className="mt-8 flex justify-center space-x-2">
                    {Array.from({ length: count }).map((_, index) => (
                        <button
                            key={index}
                            onClick={() => api?.scrollTo(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${
                                index === current
                                    ? 'w-6 bg-green-600'
                                    : 'w-2 bg-gray-300 transition-all duration-500 dark:bg-zinc-600'
                            }`}
                            aria-label={`Aller au témoignage ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};
