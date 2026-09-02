# CONTEXTE

Génère un dashboard d'administration complet avec React + TypeScript, Tailwind CSS
et shadcn/ui. L'identité visuelle est strictement noir & blanc (monochrome),
avec support natif des thèmes light et dark.

# DIRECTION ARTISTIQUE

Style : sobre, dense en information, inspiré de Vercel / Linear / shadcn ui.
Aucune couleur saturée. La hiérarchie repose uniquement sur :

- le contraste (noir, blancs, échelle de gris `neutral` / `zinc`)
- l'épaisseur des bordures (1px, `border-border`)
- l'espacement et la taille de typo
- l'état des composants (hover, focus, selected)

Palette (variables CSS shadcn, à définir dans globals.css) :

- Light : background blanc pur, foreground quasi-noir (#0A0A0A), muted #F5F5F5,
  border #E5E5E5, card blanc.
- Dark : background #0A0A0A, foreground #FAFAFA, muted #171717, border #262626.
- `--primary` = noir en light / blanc en dark (inversion complète).
- `--radius: 0.5rem`.

INTERDITS : dégradés, ombres portées marquées (`shadow-lg`+), icônes colorées,
illustrations colorées, glassmorphism, couleurs de marque.
AUTORISÉ avec parcimonie : les couleurs sémantiques (destructive/success/warning)
uniquement sur les badges de statut et les alertes, en version désaturée
(ex. rouge #DC2626 sur fond #FEF2F2), jamais en aplat sur de grandes surfaces.

# TYPOGRAPHIE

- Sans-serif : Geist Sans ou Inter. Mono : Geist Mono / JetBrains Mono pour les
  chiffres, IDs, montants et code.
- Échelle : page title `text-2xl font-semibold tracking-tight`,
  section `text-lg font-medium`, body `text-sm`, meta `text-xs text-muted-foreground`.
- Chiffres des KPI : `text-3xl font-semibold tabular-nums`.

# STRUCTURE

1. Sidebar (composant `sidebar` de shadcn, collapsible en mode icône, persistée) :
   logo + nom en haut, groupes de navigation avec labels `text-xs uppercase
text-muted-foreground`, icônes lucide-react 16px, item actif = fond `bg-accent`
   sans barre colorée. Bas de sidebar : user card avec DropdownMenu (profil,
   paramètres, thème, déconnexion).
2. Header sticky (h-14, `border-b`) : SidebarTrigger, Breadcrumb, puis à droite
   une barre de recherche déclenchant un Command palette (⌘K), un bouton
   notifications, et le toggle light/dark.
3. Zone principale : `p-6 space-y-6`, largeur max fluide.

# CONTENU DU DASHBOARD

- Ligne de 4 Cards KPI : label discret, valeur en gros, variation en `text-xs`
  avec flèche haut/bas (couleur uniquement sur le texte de variation).
- Un graphique principal (recharts via `chart` de shadcn) : courbe/aire en
  monochrome (stroke `--foreground`, aire en opacité 10%), grille très légère,
  tooltip shadcn, Tabs pour changer la période (7j / 30j / 3 mois).
- Un second graphique en barres, plus étroit, à côté d'une liste "Activité
  récente" (Avatar + texte + timestamp relatif).
- Un DataTable (TanStack Table) : tri, filtre par colonne, recherche globale,
  sélection par checkbox, pagination, menu `...` par ligne, colonne statut en
  Badge `variant="outline"` avec un point coloré 6px comme seul indice de couleur.

# COMPOSANTS shadcn À UTILISER

sidebar, card, button, badge, table, tabs, chart, dropdown-menu, command, dialog,
sheet, input, select, avatar, separator, skeleton, tooltip, sonner, scroll-area.
N'invente pas de composants custom si un équivalent shadcn existe.

# ÉTATS À PRÉVOIR

- Loading : Skeleton respectant exactement le layout final (pas de spinner plein écran).
- Empty state : icône outline, titre, phrase d'explication, bouton d'action.
- Erreur : Alert `variant="destructive"` + bouton "Réessayer".

# RESPONSIVE

- < 768px : sidebar en Sheet, KPI en 1 colonne, DataTable en cartes empilées.
- 768–1280px : KPI en 2 colonnes.
- > 1280px : layout complet 4 colonnes.

# QUALITÉ ATTENDUE

- Accessibilité : focus visible (`ring-2 ring-ring ring-offset-2`), navigation
  clavier complète, aria-labels sur les boutons icônes, contraste AA minimum.
- Code : composants séparés et typés, données mockées réalistes dans un fichier
  dédié, aucune valeur de couleur en dur (uniquement les variables CSS/Tailwind).
- Transitions courtes (150ms) sur hover et ouverture de sidebar, rien de plus.
