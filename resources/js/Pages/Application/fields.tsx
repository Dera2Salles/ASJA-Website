import { AlertCircle } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Briques de formulaire du parcours de candidature.
 *
 * Elles reprennent la langue visuelle du site public — angles droits, filet
 * plutôt qu'ombre, libellé en petites capitales — plutôt que celle de
 * l'administration : le candidat est sur le site, pas dans un back-office.
 */

export const fieldLabel =
    'text-muted-foreground block text-[11px] font-bold uppercase tracking-[0.14em]';

export const fieldBox =
    'border-border bg-card text-foreground placeholder:text-muted-foreground h-12 w-full border px-4 text-[15px] font-medium focus:border-primary focus:outline-none';

/* Le sélecteur natif, comme sur l'écran d'inscription : celui de Radix s'ouvre
   dans un portail, hors de l'enveloppe `square-corners`, et y garderait des
   angles arrondis. Sur téléphone il ouvre en plus la roue du système. */
export const fieldSelect = `${fieldBox} appearance-none pr-10`;

/** Marque des champs obligatoires, annoncée aux lecteurs d'écran. */
export const Required = () => (
    <span className="text-primary ml-1" aria-hidden="true">
        *
    </span>
);

export const FieldError = ({ message }: { message?: string }) =>
    message ? (
        <p
            role="alert"
            className="text-destructive mt-1.5 flex items-start gap-1.5 text-[12.5px] font-semibold"
        >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            <span>{message}</span>
        </p>
    ) : null;

interface FieldProps {
    id: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    className?: string;
    children: ReactNode;
}

/** Enveloppe commune : libellé, champ, aide, erreur. */
export const Field = ({
    id,
    label,
    required,
    error,
    hint,
    className,
    children,
}: FieldProps) => (
    <div className={className}>
        <label htmlFor={id} className={fieldLabel}>
            {label}
            {required && <Required />}
        </label>
        <div className="mt-2">{children}</div>
        {hint && !error && (
            <p className="text-muted-foreground mt-1.5 text-[12.5px]">{hint}</p>
        )}
        <FieldError message={error} />
    </div>
);

interface TextFieldProps extends Omit<FieldProps, 'children'> {
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    autoComplete?: string;
    inputMode?: 'text' | 'tel' | 'email' | 'numeric';
    max?: string;
    min?: string;
}

export const TextField = ({
    value,
    onChange,
    type = 'text',
    placeholder,
    autoComplete,
    inputMode,
    max,
    min,
    ...field
}: TextFieldProps) => (
    <Field {...field}>
        <input
            id={field.id}
            name={field.id}
            type={type}
            value={value}
            placeholder={placeholder}
            autoComplete={autoComplete}
            inputMode={inputMode}
            max={max}
            min={min}
            aria-required={field.required}
            aria-invalid={field.error ? true : undefined}
            onChange={(event) => onChange(event.target.value)}
            className={fieldBox}
        />
    </Field>
);

interface SelectFieldProps extends Omit<FieldProps, 'children'> {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    options: { value: string; label: string }[];
}

export const SelectField = ({
    value,
    onChange,
    placeholder = 'Sélectionner…',
    options,
    ...field
}: SelectFieldProps) => (
    <Field {...field}>
        <div className="relative">
            <select
                id={field.id}
                name={field.id}
                value={value}
                aria-required={field.required}
                aria-invalid={field.error ? true : undefined}
                onChange={(event) => onChange(event.target.value)}
                className={fieldSelect}
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>
                        {option.label}
                    </option>
                ))}
            </select>
            <span
                aria-hidden="true"
                className="text-muted-foreground pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-[11px]"
            >
                ▼
            </span>
        </div>
    </Field>
);

interface ChoiceProps {
    name: string;
    label: string;
    required?: boolean;
    error?: string;
    hint?: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string; description?: string }[];
    /** Une seule colonne par défaut au-delà de deux choix. */
    columns?: 1 | 2;
}

/**
 * Choix exclusif présenté en cartes cliquables plutôt qu'en boutons radio nus :
 * la cible tactile fait toute la largeur, et le choix retenu se lit d'un coup
 * d'œil au moment du récapitulatif.
 */
export const ChoiceField = ({
    name,
    label,
    required,
    error,
    hint,
    value,
    onChange,
    options,
    columns = 2,
}: ChoiceProps) => (
    <fieldset>
        <legend className={fieldLabel}>
            {label}
            {required && <Required />}
        </legend>

        <div
            className={`mt-2 grid gap-2.5 ${
                columns === 2 ? 'sm:grid-cols-2' : 'grid-cols-1'
            }`}
        >
            {options.map((option) => {
                const checked = value === option.value;

                return (
                    <label
                        key={option.value}
                        className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${
                            checked
                                ? 'border-primary bg-primary/5'
                                : 'border-border bg-card hover:border-primary/50'
                        }`}
                    >
                        <input
                            type="radio"
                            name={name}
                            value={option.value}
                            checked={checked}
                            onChange={() => onChange(option.value)}
                            className="accent-primary mt-0.5 size-4 shrink-0"
                        />
                        <span className="min-w-0">
                            <span className="text-foreground block text-[15px] font-semibold">
                                {option.label}
                            </span>
                            {option.description && (
                                <span className="text-muted-foreground mt-0.5 block text-[13px] leading-relaxed">
                                    {option.description}
                                </span>
                            )}
                        </span>
                    </label>
                );
            })}
        </div>

        {hint && !error && (
            <p className="text-muted-foreground mt-1.5 text-[12.5px]">{hint}</p>
        )}
        <FieldError message={error} />
    </fieldset>
);

/** Titre d'étape : intitulé, phrase d'explication, rappel des obligatoires. */
export const StepHeader = ({
    title,
    description,
    showRequiredHint = true,
}: {
    title: string;
    description: string;
    showRequiredHint?: boolean;
}) => (
    <header className="border-border border-b pb-5">
        <h2 className="font-display text-foreground text-[clamp(21px,3.6vw,28px)] leading-tight font-black uppercase">
            {title}
        </h2>
        <p className="text-muted-foreground mt-2 max-w-2xl text-[14.5px] leading-relaxed">
            {description}
        </p>
        {showRequiredHint && (
            <p className="text-muted-foreground mt-3 text-[12.5px]">
                Les champs marqués d’un <span className="text-primary">*</span>{' '}
                sont obligatoires.
            </p>
        )}
    </header>
);
