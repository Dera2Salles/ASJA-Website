import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { ImageUp, Loader2, RotateCcw } from 'lucide-react';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export interface FieldSchema {
    label: string;
    type: 'text' | 'textarea' | 'html' | 'image' | 'number' | 'url' | 'list';
    help?: string;
    item_label?: string;
    fields?: Record<string, FieldSchema>;
    default?: FieldValue;
}

export type CmsItem = Record<string, string | number>;
export type FieldValue = string | number | CmsItem[];

/** Champ image : téléverse sur le disque public et conserve le chemin rendu. */
function ImageField({
    value,
    onChange,
}: {
    value: string;
    onChange: (value: string) => void;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);

    const handleFile = async (file: File) => {
        setUploading(true);
        try {
            const form = new FormData();
            form.append('image', file);
            const { data } = await axios.post(
                route('admin.component-data.image'),
                form,
            );
            onChange(data.path);
            toast.success('Image téléversée.');
        } catch {
            toast.error("L'image n'a pas pu être téléversée.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex items-center gap-4">
            <div className="bg-muted border-border h-20 w-32 shrink-0 overflow-hidden border">
                {value ? (
                    <img
                        src={value}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                        Aucune image
                    </div>
                )}
            </div>

            <div className="flex flex-col items-start gap-2">
                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) void handleFile(file);
                        e.target.value = '';
                    }}
                />

                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                >
                    {uploading ? (
                        <Loader2 className="size-4 animate-spin" />
                    ) : (
                        <ImageUp className="size-4" />
                    )}
                    {value ? 'Remplacer' : 'Téléverser'}
                </Button>

                {value ? (
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onChange('')}
                        className="text-muted-foreground h-auto px-1 py-1 text-xs font-normal"
                    >
                        <RotateCcw className="size-3" />
                        Rétablir l'image par défaut
                    </Button>
                ) : null}
            </div>
        </div>
    );
}

/** Rend un champ simple (tout sauf les listes, gérées par ListEditor). */
export function CmsField({
    id,
    schema,
    value,
    suggestions,
    onChange,
}: {
    /** Rattache le champ à son `<label>` ; absent dans les listes répétables. */
    id?: string;
    schema: FieldSchema;
    value: FieldValue;
    /**
     * Valeurs déjà employées ailleurs dans la même liste, proposées en
     * autocomplétion. Elles n'imposent rien : le champ reste libre.
     */
    suggestions?: string[];
    onChange: (value: FieldValue) => void;
}) {
    if (schema.type === 'image') {
        return (
            <ImageField
                value={String(value ?? '')}
                onChange={(v) => onChange(v)}
            />
        );
    }

    if (schema.type === 'textarea' || schema.type === 'html') {
        return (
            <Textarea
                id={id}
                rows={schema.type === 'html' ? 8 : 4}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className="resize-y"
            />
        );
    }

    const listId =
        suggestions && suggestions.length > 0 && id
            ? `${id}-options`
            : undefined;

    return (
        <>
            <Input
                id={id}
                type={schema.type === 'number' ? 'number' : 'text'}
                inputMode={schema.type === 'number' ? 'numeric' : undefined}
                list={listId}
                value={String(value ?? '')}
                onChange={(e) =>
                    onChange(
                        schema.type === 'number'
                            ? e.target.value === ''
                                ? ''
                                : Number(e.target.value)
                            : e.target.value,
                    )
                }
            />

            {listId && (
                <datalist id={listId}>
                    {suggestions!.map((option) => (
                        <option key={option} value={option} />
                    ))}
                </datalist>
            )}
        </>
    );
}
