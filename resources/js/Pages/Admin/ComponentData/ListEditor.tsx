import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { CmsField, type CmsItem, type FieldSchema } from './CmsField';

type Item = CmsItem;

/**
 * Éditeur de blocs répétables (piliers, questions, chiffres…).
 * Permet d'ajouter, supprimer et réordonner : l'ordre affiché sur le site est
 * celui défini ici.
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
    const itemFields = Object.entries(schema.fields ?? {});
    const label = schema.item_label ?? 'Élément';

    const update = (index: number, key: string, value: string | number) => {
        const next = items.map((item, i) =>
            i === index ? { ...item, [key]: value } : item,
        );
        onChange(next);
    };

    const move = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= items.length) return;

        const next = [...items];
        [next[index], next[target]] = [next[target], next[index]];
        onChange(next);
    };

    const remove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    const add = () => {
        const blank: Item = {};
        itemFields.forEach(([key, field]) => {
            blank[key] = field.type === 'number' ? 0 : '';
        });
        onChange([...items, blank]);
    };

    return (
        <div className="space-y-3">
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border-border bg-muted/30 rounded-xl border p-4"
                >
                    <div className="mb-3 flex items-center justify-between">
                        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                            {label} {index + 1}
                        </span>

                        <div className="flex items-center gap-1">
                            <button
                                type="button"
                                onClick={() => move(index, -1)}
                                disabled={index === 0}
                                aria-label="Monter"
                                className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronUp className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => move(index, 1)}
                                disabled={index === items.length - 1}
                                aria-label="Descendre"
                                className="text-muted-foreground hover:text-foreground cursor-pointer rounded p-1 transition-colors disabled:cursor-not-allowed disabled:opacity-30"
                            >
                                <ChevronDown className="h-4 w-4" />
                            </button>
                            <button
                                type="button"
                                onClick={() => remove(index)}
                                aria-label="Supprimer"
                                className="text-muted-foreground hover:text-destructive cursor-pointer rounded p-1 transition-colors"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3">
                        {itemFields.map(([key, field]) => (
                            <div key={key} className="space-y-1.5">
                                <label className="text-foreground text-xs font-medium">
                                    {field.label}
                                </label>
                                <CmsField
                                    schema={field}
                                    value={item[key] ?? ''}
                                    onChange={(value) =>
                                        update(index, key, value as string | number)
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            <button
                type="button"
                onClick={add}
                className="border-border text-muted-foreground hover:border-primary hover:text-primary flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed py-3 text-sm font-medium transition-colors"
            >
                <Plus className="h-4 w-4" />
                Ajouter un{' '}
                <span className="lowercase">{label}</span>
            </button>
        </div>
    );
}
