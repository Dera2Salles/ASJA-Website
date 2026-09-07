import { Check } from 'lucide-react';

export interface Step {
    title: string;
    short: string;
    description: string;
}

interface Props {
    steps: Step[];
    current: number;
    /** Étapes déjà validées : elles seules sont cliquables en arrière. */
    furthest: number;
    onSelect: (step: number) => void;
}

/**
 * Indicateur de progression.
 *
 * Deux formes pour le même état : une barre chiffrée sur téléphone, où sept
 * intitulés ne tiennent pas, et un sommaire vertical à partir du grand écran,
 * qui sert aussi de navigation vers les étapes déjà remplies. Aucune étape en
 * avant n'est atteignable au clic : on ne saute pas un champ obligatoire.
 */
export const Stepper = ({ steps, current, furthest, onSelect }: Props) => {
    const progress = Math.round(((current + 1) / steps.length) * 100);

    return (
        <>
            {/* Téléphone et tablette */}
            <div className="lg:hidden">
                <div className="flex items-baseline justify-between gap-3">
                    <p className="text-foreground text-[13px] font-bold tracking-[0.12em] uppercase">
                        Étape {current + 1} sur {steps.length}
                    </p>
                    <p className="text-muted-foreground text-[12.5px] font-semibold">
                        {progress}%
                    </p>
                </div>

                <div
                    className="bg-border mt-2.5 h-1 w-full"
                    role="progressbar"
                    aria-valuenow={current + 1}
                    aria-valuemin={1}
                    aria-valuemax={steps.length}
                    aria-label="Progression du dossier"
                >
                    <div
                        className="bg-primary h-full transition-[width] duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-foreground mt-3 text-[15px] font-semibold">
                    {steps[current].title}
                </p>
            </div>

            {/* Grand écran : sommaire cliquable */}
            <nav aria-label="Étapes du dossier" className="hidden lg:block">
                <ol className="space-y-1">
                    {steps.map((step, index) => {
                        const done = index < furthest;
                        const active = index === current;
                        const reachable = index <= furthest;

                        return (
                            <li key={step.title}>
                                <button
                                    type="button"
                                    disabled={!reachable}
                                    onClick={() => onSelect(index)}
                                    aria-current={active ? 'step' : undefined}
                                    className={`flex w-full items-start gap-3 border-l-2 py-2.5 pl-4 text-left transition-colors ${
                                        active
                                            ? 'border-primary'
                                            : 'border-border'
                                    } ${reachable ? 'cursor-pointer' : 'cursor-default'}`}
                                >
                                    <span
                                        className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center border text-[12px] font-bold ${
                                            done
                                                ? 'border-primary bg-primary text-primary-foreground'
                                                : active
                                                  ? 'border-primary text-primary'
                                                  : 'border-border text-muted-foreground'
                                        }`}
                                    >
                                        {done ? <Check size={13} /> : index + 1}
                                    </span>

                                    <span className="min-w-0">
                                        <span
                                            className={`block text-[14px] leading-snug font-semibold ${
                                                active
                                                    ? 'text-foreground'
                                                    : reachable
                                                      ? 'text-foreground/80'
                                                      : 'text-muted-foreground'
                                            }`}
                                        >
                                            {step.short}
                                        </span>
                                    </span>
                                </button>
                            </li>
                        );
                    })}
                </ol>
            </nav>
        </>
    );
};
