import type { ElementType } from 'react';
import {
    MdBarChart,
    MdFileOpen,
    MdNewspaper,
    MdPeople,
    MdSyncLock,
} from 'react-icons/md';

export type AdminNavItem = {
    title: string;
    icon: ElementType;
    /** Index de la page dans le tableau rendu par `AdminDashboardPage`. */
    page: number;
};

/**
 * Arborescence de l'administration, groupée par domaine. Elle est partagée
 * par la barre latérale, le fil d'Ariane et la palette de commandes : une
 * seule source, trois points d'entrée.
 */
export const ADMIN_NAV_GROUPS: { label: string; items: AdminNavItem[] }[] = [
    {
        label: 'Pilotage',
        items: [
            { title: 'Statistiques', icon: MdBarChart, page: 0 },
            { title: 'Étudiants', icon: MdPeople, page: 1 },
        ],
    },
    {
        label: 'Ressources',
        items: [{ title: 'Documents', icon: MdFileOpen, page: 2 }],
    },
    {
        label: 'Publication',
        items: [
            { title: 'Annonces', icon: MdNewspaper, page: 3 },
            { title: 'Historique', icon: MdSyncLock, page: 4 },
        ],
    },
];

/** Titres repris par le fil d'Ariane de la barre supérieure. */
export const ADMIN_PAGE_TITLES = ADMIN_NAV_GROUPS.flatMap(
    (group) => group.items,
)
    .sort((a, b) => a.page - b.page)
    .map((item) => item.title);
