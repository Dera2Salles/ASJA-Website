import markerIconUrl from '@/assets/localisation.svg';
import L from 'leaflet';

/* Marqueur des cartes Leaflet.

   L'icône par défaut de Leaflet (`marker-icon.png`) est résolue à l'exécution
   à partir de l'URL de sa feuille de style. En développement le fichier est
   servi tel quel depuis `node_modules`, mais après le build Vite les assets
   sont renommés et déplacés : la requête tombait en 404 et le marqueur
   disparaissait de la carte en production. On fournit donc explicitement une
   icône importée — Vite réécrit alors l'URL vers l'asset émis.

   La pointe du pin est en bas au centre du viewBox : l'ancre vaut donc
   (largeur / 2, hauteur), et la bulle s'ouvre juste au-dessus. */
export const mapMarkerIcon = L.icon({
    iconUrl: markerIconUrl,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -32],
});
