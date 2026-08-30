import Logo from '@/assets/Logo/asja-logo.png';
import { useSection } from '@/lib/cms';
import { Link as InertiaLink, usePage } from '@inertiajs/react';
import 'leaflet/dist/leaflet.css';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { Link as ScrollTo } from 'react-scroll';

type Department = { id: number; slug: string; name: string };

const linkClass =
    'text-muted-foreground hover:text-primary cursor-pointer text-sm transition-colors';

const FooterColumn = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3
            className="mb-4 font-sans text-[11.5px] font-bold uppercase tracking-[0.16em] text-muted-foreground"
        >
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
        <span className="group-hover:text-primary flex items-start gap-2.5 text-sm text-muted-foreground">
            <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
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
            className="band-dark"
            style={{ borderTop: '1px solid var(--border)' }}
        >
            <div
                className="mx-auto w-full px-9"
                style={{ maxWidth: '1320px', paddingTop: '64px', paddingBottom: '40px' }}
            >
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
                    {/* Colonne identité */}
                    <div>
                        <img
                            src={Logo}
                            alt=""
                            className="mb-5 h-12 w-12 object-contain rounded-xl"
                        />
                        <p className="font-display text-[22px] font-extrabold uppercase tracking-tight text-foreground">
                            Université ASJA
                        </p>
                        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                            {String(
                                contact.tagline ??
                                    'Université catholique d\'Antsirabe — Excellence, Foi & Engagement.',
                            )}
                        </p>
                    </div>

                    {/* Université */}
                    <FooterColumn title="Université">
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
                    <div
                        className="mt-12 w-full overflow-hidden rounded-[16px]"
                        style={{ height: '256px', border: '1px solid var(--border)' }}
                    >
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

            {/* Bas de page */}
            <div style={{ borderTop: '1px solid var(--border)' }}>
                <div
                    className="mx-auto w-full px-9 py-5 text-xs text-muted-foreground"
                    style={{ maxWidth: '1320px' }}
                >
                    © {new Date().getFullYear()} Université ASJA. Tous droits réservés.
                </div>
            </div>
        </footer>
    );
};
