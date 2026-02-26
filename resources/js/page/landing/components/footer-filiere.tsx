import Logo from '@/assets/Logo/asja-logo.png';
import 'leaflet/dist/leaflet.css';
import { Facebook, Mail, MapPin, Phone } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

const asjaPosition: [number, number] = [-19.814068, 47.070135];

const FooterSection = ({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) => (
    <div>
        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            {title}
        </h3>
        <div className="space-y-3">{children}</div>
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
        <div className="flex items-center gap-3 text-gray-600 transition-all duration-500 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-500">
            <span className="text-green-700 transition-all duration-500 dark:text-green-500">
                {icon}
            </span>
            <span>{text}</span>
        </div>
    );

    return href ? (
        <a href={href} target="_blank" rel="noopener noreferrer">
            {content}
        </a>
    ) : (
        content
    );
};
export const FooterFiliereSection = () => {
    return (
        <footer
            id="contact"
            className="border-t-2 border-gray-200 bg-gray-100 text-gray-800 transition-all duration-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
        >
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
                    <div className="flex flex-col items-center text-center md:items-start md:text-left">
                        <img
                            className="mb-4 h-24 w-24"
                            src={Logo}
                            alt="Logo de l'université ASJA"
                        />
                        <h2 className="text-xl font-bold text-gray-900 transition-all duration-500 dark:text-white">
                            Université ASJA
                        </h2>
                        <p className="mt-2 text-gray-500 transition-all duration-500 dark:text-gray-400">
                            Formation d'excellence pour un avenir brillant.
                        </p>
                    </div>

                    <FooterSection title="Contactez-nous">
                        <InfoItem
                            icon={<Phone size={20} />}
                            text="034 49 483 19"
                        />
                        <InfoItem
                            icon={<Mail size={20} />}
                            text="asja@moov.mg"
                            href="mailto:asja@moov.mg"
                        />
                        <InfoItem
                            icon={<MapPin size={20} />}
                            text="Antsaha, Antsirabe, Madagascar"
                        />
                        <InfoItem
                            icon={<Facebook size={20} />}
                            text="Suivez-nous sur Facebook"
                            href="https://www.facebook.com/UniversiteASJA"
                        />
                    </FooterSection>

                    <div className="h-64 w-full overflow-hidden rounded-2xl shadow-lg md:h-full">
                        <MapContainer
                            className="z-10 h-full w-full"
                            center={asjaPosition}
                            zoom={15}
                            scrollWheelZoom={false}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={asjaPosition}>
                                <Popup>Athénée Saint Joseph Antsirabe</Popup>
                            </Marker>
                        </MapContainer>
                    </div>
                </div>
            </div>

            <div className="bg-gray-200 py-4 transition-all duration-500 dark:bg-zinc-800">
                <div className="container mx-auto px-4 text-center text-sm text-gray-500 transition-all duration-500 dark:text-gray-400">
                    <p>
                        © {new Date().getFullYear()} Université ASJA. Tous
                        droits réservés.
                    </p>
                </div>
            </div>
        </footer>
    );
};
