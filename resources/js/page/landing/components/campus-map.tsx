import { mapMarkerIcon } from '@/lib/map-marker';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

/**
 * Carte de localisation du campus.
 *
 * Fichier séparé et chargé à la demande : Leaflet et sa feuille de style pèsent
 * une bonne moitié du JavaScript du pied de page, pour une carte posée tout en
 * bas que la plupart des visites n'atteignent jamais. Le pied de page ne
 * l'importe donc qu'au moment où elle approche de l'écran — voir `footer.tsx`.
 */
export default function CampusMap({
    latitude,
    longitude,
    label,
}: {
    latitude: number;
    longitude: number;
    label: string;
}) {
    return (
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
            <Marker position={[latitude, longitude]} icon={mapMarkerIcon}>
                <Popup>{label}</Popup>
            </Marker>
        </MapContainer>
    );
}
