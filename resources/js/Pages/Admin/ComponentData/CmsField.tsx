import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';
import { ImageUp, Loader2, Trash2 } from 'lucide-react';
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
            <div className="bg-muted border-border h-20 w-32 shrink-0 overflow-hidden rounded-lg border">
                {value ? (
                    <img
                        src={value}
                        alt=""
                        className="h-full w-full object-cover"
                    />
                ) : (
                    <div className="text-muted-foreground flex h-full items-center justify-center text-xs">
                        Aucune image
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-2">
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
                <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={uploading}
                    className="border-border text-foreground hover:border-primary hover:text-primary inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors disabled:opacity-50"
                >
                    {uploading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <ImageUp className="h-3.5 w-3.5" />
                    )}
                    {value ? 'Remplacer' : 'Téléverser'}
                </button>

                {value ? (
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="text-muted-foreground hover:text-destructive inline-flex cursor-pointer items-center gap-1.5 text-xs transition-colors"
                    >
                        <Trash2 className="h-3 w-3" />
                        Rétablir l'image par défaut
                    </button>
                ) : null}
            </div>
        </div>
    );
}

/** Rend un champ simple (tout sauf les listes, gérées par ListEditor). */
export function CmsField({
    schema,
    value,
    onChange,
}: {
    schema: FieldSchema;
    value: FieldValue;
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
                rows={schema.type === 'html' ? 8 : 4}
                value={String(value ?? '')}
                onChange={(e) => onChange(e.target.value)}
                className="resize-y"
            />
        );
    }

    return (
        <Input
            type={schema.type === 'number' ? 'number' : 'text'}
            inputMode={schema.type === 'number' ? 'numeric' : undefined}
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
    );
}
