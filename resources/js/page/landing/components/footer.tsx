import { Img } from '@/Components/Img';
import { useSection } from '@/lib/cms';
import { Link as InertiaLink, usePage } from '@inertiajs/react';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { Link as ScrollTo } from 'react-scroll';

/* Leaflet n'arrive qu'avec la carte, et la carte qu'à son approche : le pied
   de page est le même sur toutes les pages publiques, il ne peut pas faire
   payer sa carte à qui ne descend jamais jusqu'à elle. */
const CampusMap = lazy(() => import('./campus-map'));

type Department = { id: number; slug: string; name: string };

// `py-1` + `w-fit` : sans eux, deux liens consécutifs n'étaient séparés que
// d'une dizaine de pixels — une cible trop fine pour un pouce.
const linkClass =
    'text-muted-foreground hover:text-primary inline-flex w-fit cursor-pointer items-center py-1.5 text-sm transition-colors';

/**
 * Cadre de la carte. Il réserve sa hauteur dès le premier rendu — la carte
 * arrivant plus tard ne déplace donc rien — et ne demande le module Leaflet
 * qu'une fois le cadre proche de l'écran.
 */
const MapFrame = ({
    latitude,
    longitude,
}: {
    latitude: number;
    longitude: number;
}) => {
    const frame = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = frame.current;
        if (!node || visible) return;

        // Sans IntersectionObserver (navigateurs anciens), la carte se charge
        // tout de suite : mieux vaut un peu de poids qu'un cadre vide.
        if (typeof IntersectionObserver === 'undefined') {
            setVisible(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            // 300 px d'avance : la carte a le temps d'arriver avant d'être vue.
            { rootMargin: '300px' },
        );

        observer.observe(node);
        return () => observer.disconnect();
    }, [visible]);

    return (
        <div
            ref={frame}
            className="bg-muted mt-10 h-[200px] w-full overflow-hidden rounded-[16px] sm:mt-12 sm:h-[256px]"
            style={{ border: '1px solid var(--border)' }}
        >
            {visible ? (
                <Suspense fallback={null}>
                    <CampusMap
                        latitude={latitude}
                        longitude={longitude}
                        label="Université ASJA"
                    />
                </Suspense>
            ) : null}
        </div>
    );
};

const FooterColumn = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3 className="text-muted-foreground mb-4 font-sans text-[11.5px] font-bold tracking-[0.16em] uppercase">
            {title}
        </h3>
        <div className="flex flex-col gap-2.5">{children}</div>
    </div>
);

const InfoItem = ({
    icon,
    text,
    href,
}: {
    icon: React.ReactNode;
    text: string;
    href?: string;
}) => {
    const content = (
        <span className="group-hover:text-primary text-muted-foreground flex items-start gap-2.5 py-1.5 text-sm">
            <span className="text-primary mt-0.5 shrink-0">{icon}</span>
            <span>{text}</span>
        </span>
    );

    return href ? (
        <a
            href={href}
            target={href.startsWith('http') ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="group"
        >
            {content}
        </a>
    ) : (
        <span className="group">{content}</span>
    );
};

export const Footer = () => {
    const contact = useSection('contact');

    const { departments } = usePage().props as unknown as {
        departments?: Department[];
    };

    const latitude = Number(contact.latitude ?? 0);
    const longitude = Number(contact.longitude ?? 0);
    const hasPosition =
        Number.isFinite(latitude) &&
        Number.isFinite(longitude) &&
        !(latitude === 0 && longitude === 0);

    const email = String(contact.email ?? '');
    const phone = String(contact.phone ?? '');
    const facebook = String(contact.facebook ?? '');

    return (
        <footer
            id="contact"
            className="band-light"
            style={{ borderTop: '1px solid var(--border)' }}
        >
            <div className="section-shell pt-12 pb-10 sm:pt-16">
                {/* Deux colonnes dès 480 px : les listes de liens sont courtes,
                    une seule colonne y laissait une bande vide à droite et
                    doublait la longueur du pied de page. */}
                <div className="grid grid-cols-1 gap-10 min-[480px]:grid-cols-2 sm:gap-12 lg:grid-cols-4">
                    {/* Colonne identité */}
                    <div>
                        <Img
                            source="Logo/asja-logo"
                            alt=""
                            sizes="48px"
                            className="mb-5 h-12 w-12 rounded-xl object-contain"
                        />
                        <p className="font-display text-foreground text-[20px] font-extrabold tracking-tight uppercase sm:text-[22px]">
                            Université ASJA
                        </p>
                        <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
                            {String(
                                contact.tagline ??
                                    "Université catholique d'Antsirabe — Excellence, Foi & Engagement.",
                            )}
                        </p>
                    </div>

                    {/* Université */}
                    <FooterColumn title="Université">
                        <InertiaLink href="/a-propos" className={linkClass}>
                            À propos
                        </InertiaLink>
                        <ScrollTo
                            to="mission"
                            spy
                            smooth
                            offset={-80}
                            duration={500}
                            className={linkClass}
                        >
                            Notre mission
                        </ScrollTo>
                        <ScrollTo
                            to="filiere"
                            spy
                            smooth
                            offset={-80}
                            duration={500}
                            className={linkClass}
                        >
                            Nos mentions
                        </ScrollTo>
                        <ScrollTo
                            to="systeme"
                            spy
                            smooth
                            offset={-80}
                            duration={500}
                            className={linkClass}
                        >
                            Méthode
                        </ScrollTo>
                        <ScrollTo
                            to="temoignages"
                            spy
                            smooth
                            offset={-80}
                            duration={500}
                            className={linkClass}
                        >
                            Témoignages
                        </ScrollTo>
                    </FooterColumn>

                    {/* Mentions */}
                    <FooterColumn title="Mentions">
                        {(departments ?? []).map((dept) => (
                            <InertiaLink
                                key={dept.id}
                                href={`/mention/${dept.slug}`}
                                className={linkClass}
                            >
                                {dept.name}
                            </InertiaLink>
                        ))}
                    </FooterColumn>

                    {/* Contact */}
                    <FooterColumn title="Contact">
                        {phone ? (
                            <InfoItem icon={<Phone size={16} />} text={phone} />
                        ) : null}
                        {email ? (
                            <InfoItem
                                icon={<Mail size={16} />}
                                text={email}
                                href={`mailto:${email}`}
                            />
                        ) : null}
                        {contact.address ? (
                            <InfoItem
                                icon={<MapPin size={16} />}
                                text={String(contact.address)}
                            />
                        ) : null}
                        {facebook ? (
                            <InfoItem
                                icon={<Facebook size={16} />}
                                text="Suivez-nous sur Facebook"
                                href={facebook}
                            />
                        ) : null}
                    </FooterColumn>
                </div>

                {/* Carte */}
                {hasPosition ? (
                    <MapFrame latitude={latitude} longitude={longitude} />
                ) : null}
            </div>

            {/* Bas de page */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
                <div className="section-shell text-muted-foreground py-5 text-xs">
                    © {new Date().getFullYear()} Université ASJA. Tous droits
                    réservés.
                </div>
            </div>
        </footer>
    );
};
