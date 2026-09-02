import { EmptyState } from '@/components/admin/primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    ChevronDown,
    ChevronRight,
    ChevronUp,
    List,
    Plus,
    Search,
    Trash2,
    X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { CmsField, type CmsItem, type FieldSchema } from './CmsField';

type Item = CmsItem;

/** Au-delà de ce nombre de blocs, le filtre de recherche apparaît. */
const SEARCH_THRESHOLD = 6;

/** Bouton de contrôle d'un bloc : neutre, carré, toujours nommé. */
const ItemButton = ({
    label,
    onClick,
    disabled,
    danger,
    children,
}: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    danger?: boolean;
    children: React.ReactNode;
}) => (
    <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        title={label}
        className={
            danger
                ? 'text-muted-foreground hover:bg-destructive-surface hover:text-destructive size-7'
                : 'text-muted-foreground hover:text-foreground size-7'
        }
    >
        {children}
    </Button>
);

/**
 * Éditeur de blocs répétables (piliers, questions, chiffres…).
 *
 * Les blocs sont repliés par défaut : une liste de onze questions tient alors
 * dans un écran au lieu d'une trentaine de champs empilés. Chaque ligne se lit
 * comme une ligne de tableau — rang, résumé, étiquettes — et ne s'ouvre que
 * pour être modifiée. Ajout, suppression et réordonnancement restent
 * accessibles depuis la ligne repliée ; l'ordre défini ici est celui affiché
 * sur le site.
 */
export function ListEditor({
    schema,
    items,
    onChange,
}: {
    schema: FieldSchema;
    items: Item[];
    onChange: (items: Item[]) => void;
}) {
    const itemFields = useMemo(
        () => Object.entries(schema.fields ?? {}),
        [schema],
    );
    const label = schema.item_label ?? 'Élément';
    const lowerLabel = label.toLowerCase();
    const plural = items.length > 1 ? 's' : '';

    /* Repli suivi par index : les index bougent au déplacement et à la
       suppression, les mutations ci-dessous les recalent donc à chaque fois. */
    const [expanded, setExpanded] = useState<Set<number>>(new Set());
    const [query, setQuery] = useState('');

    /* Le premier champ texte sert de titre de ligne ; les autres champs courts
       deviennent les étiquettes affichées à sa droite. */
    const titleKey =
        itemFields.find(([, field]) => field.type === 'text')?.[0] ??
        itemFields[0]?.[0];

    const metaKeys = itemFields
        .filter(
            ([key, field]) =>
                key !== titleKey &&
                (field.type === 'text' || field.type === 'number'),
        )
        .map(([key]) => key);

    /* Valeurs déjà saisies dans les autres blocs, proposées en autocomplétion :
       une catégorie ne se dédouble plus sur une faute de frappe. Un champ dont
       chaque bloc a une valeur unique (une question, un nom) n'a rien à
       suggérer — seules les valeurs manifestement répétées sont retenues. */
    const suggestions = useMemo(() => {
        const map: Record<string, string[]> = {};
        itemFields.forEach(([key, field]) => {
            if (field.type !== 'text') return;
            const values = Array.from(
                new Set(
                    items
                        .map((item) => String(item[key] ?? '').trim())
                        .filter(Boolean),
                ),
            );
            if (values.length >= 2 && values.length <= items.length / 2) {
                map[key] = values.sort((a, b) => a.localeCompare(b, 'fr'));
            }
        });
        return map;
    }, [items, itemFields]);

    const toggle = (index: number) => {
        setExpanded((current) => {
            const next = new Set(current);
            if (!next.delete(index)) next.add(index);
            return next;
        });
    };

    const update = (index: number, key: string, value: string | number) => {
        onChange(
            items.map((item, i) =>
                i === index ? { ...item, [key]: value } : item,
            ),
        );
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);

        setExpanded((current) => {
            const set = new Set(current);
            const hadIndex = current.has(index);
            const hadTarget = current.has(target);
            set.delete(index);
            set.delete(target);
            if (hadIndex) set.add(target);
            if (hadTarget) set.add(index);
            return set;
        });
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
        setExpanded((current) => {
            const set = new Set<number>();
            current.forEach((i) => {
                if (i < index) set.add(i);
                else if (i > index) set.add(i - 1);
            });
            return set;
        });
    };

    const add = () => {
        const blank: Item = {};
        itemFields.forEach(([key, field]) => {
            blank[key] = field.type === 'number' ? 0 : '';
        });
        onChange([...items, blank]);
        /* Le bloc neuf est vide : il s'ouvre seul, sinon sa ligne n'offrirait
           rien à lire ni à saisir. */
        setExpanded((current) => new Set(current).add(items.length));
        setQuery('');
    };

    const addButton = (
        <Button type="button" variant="outline" size="sm" onClick={add}>
            <Plus className="size-4" />
            Ajouter un {lowerLabel}
        </Button>
    );

    if (items.length === 0) {
        return (
            <div className="border-border border border-dashed">
                <EmptyState
                    icon={List}
                    title={`Aucun ${lowerLabel}`}
                    description="Ajoutez un premier bloc ; l'ordre défini ici est celui affiché sur le site."
                    action={addButton}
                    className="py-10"
                />
            </div>
        );
    }

    const needle = query.trim().toLowerCase();

    /* Le filtre conserve l'index réel de chaque bloc : toutes les mutations
       continuent de viser le bon, même quand la liste affichée est partielle. */
    const visible = items
        .map((item, index) => ({ item, index }))
        .filter(
            ({ item }) =>
                !needle ||
                itemFields.some(([key]) =>
                    String(item[key] ?? '')
                        .toLowerCase()
                        .includes(needle),
                ),
        );

    const allExpanded = expanded.size >= items.length;
    const showSearch = items.length >= SEARCH_THRESHOLD;

    return (
        <div className="border-border border">
            {/* Barre d'outils : le compte à gauche, le filtre et les actions à
                droite. Elle surplombe la liste, elle n'en fait pas partie. */}
            <div className="border-border bg-muted/40 flex flex-wrap items-center gap-2 border-b px-3 py-2">
                <span className="admin-meta mr-auto">
                    {needle
                        ? `${visible.length} sur ${items.length} ${lowerLabel}${plural}`
                        : `${items.length} ${lowerLabel}${plural}`}
                </span>

                {showSearch && (
                    <div className="relative w-full sm:w-56">
                        <Search
                            className="text-muted-foreground pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            type="search"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder={`Filtrer les ${lowerLabel}s…`}
                            aria-label={`Filtrer les ${lowerLabel}s`}
                            className="h-8 pl-7 text-sm"
                        />
                    </div>
                )}

                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground h-8"
                    onClick={() =>
                        setExpanded(
                            allExpanded
                                ? new Set()
                                : new Set(items.map((_, i) => i)),
                        )
                    }
                >
                    {allExpanded ? 'Tout replier' : 'Tout déplier'}
                </Button>

                {addButton}
            </div>

            {visible.length === 0 ? (
                <EmptyState
                    icon={Search}
                    title="Aucun résultat"
                    description={`Aucun ${lowerLabel} ne correspond à « ${query.trim()} ».`}
                    action={
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setQuery('')}
                        >
                            <X className="size-4" />
                            Effacer le filtre
                        </Button>
                    }
                    className="py-10"
                />
            ) : (
                <ul className="divide-border divide-y">
                    {visible.map(({ item, index }) => {
                        const isOpen = expanded.has(index);
                        const title = String(item[titleKey ?? ''] ?? '').trim();
                        const metas = metaKeys
                            .map((key) => String(item[key] ?? '').trim())
                            .filter(Boolean);

                        return (
                            <li key={index}>
                                {/* Ligne repliée : rang, résumé, étiquettes,
                                    puis les contrôles alignés à droite. */}
                                <div className="hover:bg-accent/50 flex items-center gap-2 px-3 py-1.5">
                                    <button
                                        type="button"
                                        onClick={() => toggle(index)}
                                        aria-expanded={isOpen}
                                        aria-controls={`item-panel-${index}`}
                                        className="flex min-w-0 flex-1 items-center gap-2 py-1 text-left"
                                    >
                                        {isOpen ? (
                                            <ChevronDown
                                                className="text-muted-foreground size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        ) : (
                                            <ChevronRight
                                                className="text-muted-foreground size-4 shrink-0"
                                                aria-hidden="true"
                                            />
                                        )}

                                        <span className="admin-mono text-muted-foreground w-6 shrink-0 text-right">
                                            {index + 1}
                                        </span>

                                        <span
                                            className={
                                                title
                                                    ? 'text-foreground truncate text-sm'
                                                    : 'text-muted-foreground truncate text-sm italic'
                                            }
                                        >
                                            {title || `${label} sans titre`}
                                        </span>

                                        {metas.length > 0 && (
                                            <span className="admin-meta ml-auto hidden shrink-0 pl-3 sm:block">
                                                {metas.join(' · ')}
                                            </span>
                                        )}
                                    </button>

                                    <div className="flex shrink-0 items-center gap-0.5">
                                        <ItemButton
                                            label="Monter"
                                            onClick={() => move(index, -1)}
                                            disabled={
                                                index === 0 || Boolean(needle)
                                            }
                                        >
                                            <ChevronUp className="size-4" />
                                        </ItemButton>
                                        <ItemButton
                                            label="Descendre"
                                            onClick={() => move(index, 1)}
                                            disabled={
                                                index === items.length - 1 ||
                                                Boolean(needle)
                                            }
                                        >
                                            <ChevronDown className="size-4" />
                                        </ItemButton>
                                        <ItemButton
                                            label={`Supprimer ce ${lowerLabel}`}
                                            onClick={() => remove(index)}
                                            danger
                                        >
                                            <Trash2 className="size-4" />
                                        </ItemButton>
                                    </div>
                                </div>

                                {isOpen && (
                                    <div
                                        id={`item-panel-${index}`}
                                        className="border-border bg-muted/20 grid gap-3 border-t px-3 py-4 sm:pl-11"
                                    >
                                        {itemFields.map(([key, field]) => (
                                            <div
                                                key={key}
                                                className="space-y-1.5"
                                            >
                                                <label
                                                    htmlFor={`item-${index}-${key}`}
                                                    className="text-foreground block text-xs font-medium"
                                                >
                                                    {field.label}
                                                </label>
                                                <CmsField
                                                    id={`item-${index}-${key}`}
                                                    schema={field}
                                                    value={item[key] ?? ''}
                                                    suggestions={
                                                        suggestions[key]
                                                    }
                                                    onChange={(value) =>
                                                        update(
                                                            index,
                                                            key,
                                                            value as
                                                                | string
                                                                | number,
                                                        )
                                                    }
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>
            )}

            {/* Le réordonnancement ne vise que des voisins : il n'a pas de sens
                sur une liste filtrée, on le dit plutôt que de le laisser
                échouer en silence. */}
            {needle && (
                <p className="admin-meta border-border border-t px-3 py-2">
                    Le réordonnancement est suspendu tant qu'un filtre est
                    actif.
                </p>
            )}
        </div>
    );
}
