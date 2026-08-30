import Logo from '@/assets/Logo/asja-logo.png';
import { useSection } from '@/lib/cms';
import { Link as InertiaLink, usePage } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link as ScrollTo } from 'react-scroll';

type Department = { id: number; slug: string; name: string };

const linkClass =
    'text-muted-foreground hover:text-primary cursor-pointer text-sm';

const FooterColumn = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3 className="text-foreground mb-4 text-xs font-semibold tracking-[0.14em] uppercase">
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
        <span className="text-muted-foreground group-hover:text-primary flex items-start gap-2.5 text-sm">
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
    const hasPosition = Number.isFinite(latitude) && Number.isFinite(longitude)
        && !(latitude === 0 && longitude === 0);

    const email = String(contact.email ?? '');
    const phone = String(contact.phone ?? '');
    const facebook = String(contact.facebook ?? '');

    return (
        <footer id="contact" className="bg-foreground text-background border-border border-t">
            <div className="section-container py-16">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
                    <div>
                        <img
                            className="mb-4 h-16 w-16 object-contain"
                            src={Logo}
                            alt=""
                        />
                        <p className="font-display text-foreground text-lg font-bold">
                            Université ASJA
                        </p>
                        <p className="text-muted-foreground mt-2 max-w-xs text-sm leading-relaxed">
                            {String(contact.tagline ?? '')}
                        </p>
                    </div>

                    <FooterColumn title="Navigation">
                        <ScrollTo to="mission" spy smooth offset={-80} duration={500} className={linkClass}>
                            Notre mission
                        </ScrollTo>
                        <ScrollTo to="filiere" spy smooth offset={-80} duration={500} className={linkClass}>
                            Nos mentions
                        </ScrollTo>
                        <ScrollTo to="systeme" spy smooth offset={-80} duration={500} className={linkClass}>
                            Système pédagogique
                        </ScrollTo>
                        <InertiaLink href="/actualites" className={linkClass}>
                            Actualités & événements
                        </InertiaLink>
                    </FooterColumn>

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

                    <FooterColumn title="Contact">
                        {phone ? <InfoItem icon={<Phone size={16} />} text={phone} /> : null}
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

                {hasPosition ? (
                    <div className="border-background mt-12 h-64 w-full overflow-hidden border">
                        <MapContainer
                            className="z-0 h-full w-full"
                            center={[latitude, longitude]}
                            zoom={15}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={[latitude, longitude]}>
                                <Popup>Université ASJA</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                ) : null}
            </div>

            <div className="border-background border-t">
                <div className="section-container text-background/70 py-5 text-center text-xs">
                    © {new Date().getFullYear()} Université ASJA. Tous droits
                    réservés.
                </div>
            </div>
        </footer>
    );
};
