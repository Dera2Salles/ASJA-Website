import {
    Check,
    FileText,
    Loader2,
    Paperclip,
    RefreshCw,
    Trash2,
    Upload,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { FieldError, Required } from './fields';
import type { DocumentSpec, FormOptions } from './types';
import { formatSize, validateFile } from './validation';

/**
 * Dépôt d'une pièce justificative.
 *
 * Le fichier reste dans le navigateur jusqu'à la soumission : il part avec le
 * reste du dossier, en un seul envoi. Téléverser au fil de l'eau aurait
 * demandé un stockage temporaire côté serveur, donc un ramassage des fichiers
 * abandonnés par tous les formulaires jamais terminés — pour un gain nul, le
 * candidat ne pouvant de toute façon pas soumettre avant d'avoir tout choisi.
 *
 * Le format et le poids sont vérifiés dès le choix du fichier, pour que
 * l'erreur arrive tout de suite plutôt qu'après un envoi de plusieurs mégaoctets.
 */

export type UploadState = 'idle' | 'uploading' | 'sent';

interface Props {
    spec: DocumentSpec;
    options: FormOptions;
    file: File | null;
    /** Erreur venant du serveur ou du contrôle d'étape. */
    error?: string;
    required: boolean;
    state: UploadState;
    onChange: (file: File | null) => void;
}

export const FileField = ({
    spec,
    options,
    file,
    error,
    required,
    state,
    onChange,
}: Props) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [localError, setLocalError] = useState<string | undefined>();
    const [dragging, setDragging] = useState(false);

    // Les formats sont ceux de la pièce : une photo d'identité n'est pas un PDF.
    const accept = spec.extensions
        .map((extension) => `.${extension}`)
        .join(',');

    const select = (chosen: File | undefined) => {
        if (!chosen) return;

        const message = validateFile(chosen, spec, options);

        setLocalError(message);
        // Un fichier refusé ne remplace pas celui déjà choisi : le candidat
        // garde ce qu'il avait, et voit pourquoi le nouveau n'a pas été retenu.
        if (!message) onChange(chosen);
    };

    const clear = () => {
        setLocalError(undefined);
        onChange(null);
        if (inputRef.current) inputRef.current.value = '';
    };

    const shown = localError ?? error;

    return (
        <div
            className={`border p-4 sm:p-5 ${
                shown
                    ? 'border-destructive/60 bg-destructive/5'
                    : file
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border bg-card'
            }`}
        >
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                    <p className="text-foreground text-[15px] font-semibold">
                        {spec.label}
                        {required && <Required />}
                    </p>
                    <p className="text-muted-foreground mt-1 text-[13px] leading-relaxed">
                        {spec.hint}
                    </p>
                </div>

                {!required && (
                    <span className="text-muted-foreground border-border shrink-0 border px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase">
                        Facultatif
                    </span>
                )}
            </div>

            <p className="text-muted-foreground mt-3 text-[12px]">
                Formats acceptés : {spec.extensions.join(', ').toUpperCase()} —
                taille maximale : {Math.round(options.maxFileSizeKb / 1024)} Mo.
            </p>

            <input
                ref={inputRef}
                id={`document-${spec.type}`}
                type="file"
                accept={accept}
                className="sr-only"
                onChange={(event) => select(event.target.files?.[0])}
            />

            {file ? (
                <div className="border-border bg-background mt-4 flex flex-wrap items-center gap-3 border p-3">
                    <FileText
                        className="text-muted-foreground size-5 shrink-0"
                        aria-hidden="true"
                    />

                    <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-[14px] font-semibold">
                            {file.name}
                        </p>
                        <p className="text-muted-foreground mt-0.5 flex items-center gap-1.5 text-[12px]">
                            {formatSize(file.size)}
                            <span aria-hidden="true">·</span>
                            {state === 'uploading' ? (
                                <span className="text-foreground inline-flex items-center gap-1 font-semibold">
                                    <Loader2
                                        size={11}
                                        className="animate-spin"
                                    />
                                    Envoi en cours…
                                </span>
                            ) : state === 'sent' ? (
                                <span className="text-primary inline-flex items-center gap-1 font-semibold">
                                    <Check size={11} />
                                    Envoyé
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 font-semibold">
                                    <Paperclip size={11} />
                                    Prêt à être envoyé
                                </span>
                            )}
                        </p>
                    </div>

                    {state === 'idle' && (
                        <div className="flex shrink-0 items-center gap-1.5">
                            <button
                                type="button"
                                onClick={() => inputRef.current?.click()}
                                className="border-border text-foreground hover:border-primary hover:text-primary inline-flex h-9 items-center gap-1.5 border px-3 text-[12.5px] font-semibold"
                            >
                                <RefreshCw size={13} />
                                Remplacer
                            </button>
                            <button
                                type="button"
                                onClick={clear}
                                aria-label={`Supprimer le fichier « ${file.name} »`}
                                className="border-border text-muted-foreground hover:border-destructive hover:text-destructive inline-flex size-9 items-center justify-center border"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    )}
                </div>
            ) : (
                <label
                    htmlFor={`document-${spec.type}`}
                    onDragOver={(event) => {
                        event.preventDefault();
                        setDragging(true);
                    }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(event) => {
                        event.preventDefault();
                        setDragging(false);
                        select(event.dataTransfer.files?.[0]);
                    }}
                    className={`mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border border-dashed px-4 py-7 text-center transition-colors ${
                        dragging
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/60'
                    }`}
                >
                    <Upload
                        className="text-muted-foreground size-5"
                        aria-hidden="true"
                    />
                    <span className="text-foreground text-[13.5px] font-semibold">
                        Choisir un fichier
                    </span>
                    <span className="text-muted-foreground text-[12.5px]">
                        ou glissez-le dans ce cadre
                    </span>
                </label>
            )}

            <FieldError message={shown} />
        </div>
    );
};
