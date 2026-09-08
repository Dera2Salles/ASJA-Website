import { Check, Paperclip } from 'lucide-react';
import type { FormOptions } from './types';
import { documentsFor, requiredDocuments } from './validation';

/**
 * Ce qu'il faut apporter, et ce qu'il faut payer.
 *
 * Le candidat le lit avant de commencer, pas au guichet : les pièces et les
 * frais viennent du serveur (`Application::DOCUMENTS`, `Application::FEES`) —
 * ni la liste ni les montants ne sont écrits ici, faute de quoi ils
 * diraient un jour autre chose que l'accusé de réception.
 *
 * Tant qu'aucun type de demande n'est retenu, les deux dossiers sont montrés
 * côte à côte : c'est précisément le moment où la question se pose.
 */
const Card = ({
    options,
    type,
    title,
}: {
    options: FormOptions;
    type: string;
    title: string;
}) => {
    const documents = documentsFor(options, type);
    const required = requiredDocuments(options, type);
    const fees = options.fees[type];

    return (
        <section className="border-border bg-card border p-5">
            <h3 className="text-foreground text-[14px] font-bold tracking-[0.06em] uppercase">
                {title}
            </h3>

            <p className="text-muted-foreground mt-3 flex items-center gap-2 text-[11px] font-bold tracking-[0.14em] uppercase">
                <Paperclip size={12} />
                Pièces à fournir
            </p>

            <ul className="mt-2.5 space-y-2.5">
                {documents.map((document) => (
                    <li key={document.type} className="flex items-start gap-2">
                        <Check
                            size={14}
                            className="text-primary mt-[3px] shrink-0"
                        />
                        <span className="min-w-0">
                            <span className="text-foreground block text-[14px] font-semibold">
                                {document.label}
                                {!required.includes(document.type) && (
                                    <span className="text-muted-foreground font-medium">
                                        {' '}
                                        (facultatif)
                                    </span>
                                )}
                            </span>
                            <span className="text-muted-foreground block text-[12.5px] leading-relaxed">
                                {document.hint}
                            </span>
                        </span>
                    </li>
                ))}
            </ul>

            {fees && fees.lines.length > 0 && (
                <>
                    <p className="text-muted-foreground mt-5 text-[11px] font-bold tracking-[0.14em] uppercase">
                        Frais
                    </p>

                    {/* Le moment compte autant que le montant : une première
                        inscription ne verse les frais généraux qu'une fois son
                        dossier validé. */}
                    <dl className="mt-2">
                        {fees.lines.map((fee) => (
                            <div
                                key={fee.label}
                                className="border-border flex items-baseline justify-between gap-4 border-t py-2"
                            >
                                <dt className="min-w-0">
                                    <span className="text-foreground block text-[13.5px] font-semibold">
                                        {fee.label}
                                    </span>
                                    <span className="text-muted-foreground block text-[12px]">
                                        {fee.moment}
                                    </span>
                                </dt>
                                <dd className="text-foreground text-[14px] font-semibold whitespace-nowrap">
                                    {fee.formatted}
                                </dd>
                            </div>
                        ))}
                    </dl>

                    {fees.dueAtSubmission && (
                        <p className="border-foreground text-foreground mt-3 border-t-2 pt-3 text-[13.5px] leading-relaxed">
                            Bordereau à joindre au dossier&nbsp;:{' '}
                            <strong>{fees.dueAtSubmission}</strong>
                            {fees.dueAfterValidation && (
                                <>
                                    . Les{' '}
                                    <strong>{fees.dueAfterValidation}</strong>{' '}
                                    restants ne se versent qu’une fois votre
                                    dossier validé.
                                </>
                            )}
                        </p>
                    )}
                </>
            )}
        </section>
    );
};

export const Requirements = ({
    options,
    type,
}: {
    options: FormOptions;
    /** Vide tant que le candidat n'a pas choisi : les deux dossiers s'affichent. */
    type: string;
}) => {
    const shown = type
        ? options.types.filter((option) => option.value === type)
        : options.types;

    const account = options.bankAccount;

    return (
        <div className="space-y-4">
            <div
                className={
                    shown.length > 1
                        ? 'grid gap-4 md:grid-cols-2'
                        : 'grid gap-4'
                }
            >
                {shown.map((option) => (
                    <Card
                        key={option.value}
                        options={options}
                        type={option.value}
                        title={option.label}
                    />
                ))}
            </div>

            <div className="border-primary/50 bg-primary/5 border-l-2 p-4">
                <p className="text-muted-foreground text-[11px] font-bold tracking-[0.14em] uppercase">
                    Compte de versement
                </p>
                <p className="text-foreground mt-1 text-[15px] font-bold">
                    {account.bank} {account.holder} —{' '}
                    <span className="tracking-[0.06em] whitespace-nowrap">
                        {account.number}
                    </span>
                </p>
                <p className="text-foreground mt-2 text-[13px] leading-relaxed">
                    Le <strong>bordereau de versement</strong> joint au dossier
                    fait preuve du paiement. Les pièces se téléversent en
                    version numérique (photo ou scan lisible)&nbsp;: les
                    originaux sont à présenter au bureau de la scolarité pour
                    finaliser l’inscription.
                </p>
            </div>
        </div>
    );
};
