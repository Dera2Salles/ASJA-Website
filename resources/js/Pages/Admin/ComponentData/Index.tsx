import { EmptyState, PageTitle } from '@/components/admin/primitives';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import AdminLayout from '@/Layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import { FileQuestion, Loader2, Save } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import {
    CmsField,
    type CmsItem,
    type FieldSchema,
    type FieldValue,
} from './CmsField';
import { ListEditor } from './ListEditor';

interface SectionSchema {
    label: string;
    description?: string;
    fields: Record<string, FieldSchema>;
}

interface Props {
    schema: Record<string, SectionSchema>;
    content: Record<string, Record<string, FieldValue>>;
    /** Section ouverte, décidée par le serveur d'après `?section=`. */
    activeSection: string;
}

/** Types de champ qui réclament la largeur entière de la carte. */
const WIDE_TYPES = new Set(['textarea', 'html', 'image']);

/**
 * Édition du contenu du site.
 *
 * Le formulaire est entièrement dérivé du schéma envoyé par le serveur
 * (config/cms.php) : aucun champ n'est écrit en dur ici. Ajouter un champ au
 * schéma le fait apparaître automatiquement dans cet écran.
 */
export default function ComponentDataIndex({
    schema,
    content,
    activeSection,
}: Props) {
    /** Visite en attente de confirmation, retenue par des modifications. */
    const [pendingUrl, setPendingUrl] = useState<string | null>(null);

    const { data, setData, post, processing } = useForm<{
        section: string;
        data: Record<string, FieldValue>;
    }>({
        section: activeSection,
        data: content[activeSection] ?? {},
    });

    // Après enregistrement, Inertia renvoie le contenu à jour : on resynchronise
    // le formulaire sur la section affichée.
    useEffect(() => {
        setData({
            section: activeSection,
            data: structuredClone(content[activeSection] ?? {}),
        });
    }, [activeSection, content]);

    /* Comparaison au contenu serveur plutôt qu'au `isDirty` d'Inertia : la
       resynchronisation ci-dessus marquerait le formulaire comme modifié à
       chaque changement de section. */
    const isDirty = useMemo(
        () =>
            JSON.stringify(data.data) !==
            JSON.stringify(content[activeSection] ?? {}),
        [data.data, content, activeSection],
    );

    const currentSchema = schema[activeSection];
    const fields = Object.entries(currentSchema?.fields ?? {});

    /* Les champs simples tiennent sur deux colonnes ; les listes répétables
       prennent toute la largeur et vivent dans leur propre bloc, sous un filet.
       Sans cette séparation, une section comme la FAQ empile ses quatre champs
       d'en-tête au-dessus de trente champs de questions, et il faut dérouler
       tout l'écran pour retrouver un intitulé. */
    const headerFields = fields.filter(([, field]) => field.type !== 'list');
    const listFields = fields.filter(([, field]) => field.type === 'list');

    const setField = (key: string, value: FieldValue) => {
        setData('data', { ...data.data, [key]: value });
    };

    const submit = () => {
        if (!isDirty || processing) return;
        post(route('admin.component-data.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Contenu mis à jour.'),
            onError: () => toast.error("L'enregistrement a échoué."),
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        submit();
    };

    /* Le formulaire est long : `Ctrl`/`⌘ + S` évite de remonter à la barre
       d'enregistrement, qui reste par ailleurs collée au bas de la carte.
       Le raccourci est lu dans une référence pour que l'écouteur ne soit pas
       réinscrit à chaque frappe dans un champ. */
    const submitRef = useRef(submit);
    submitRef.current = submit;

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 's' || !(event.metaKey || event.ctrlKey)) return;
            event.preventDefault();
            submitRef.current();
        };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    /* Le sommaire vit désormais dans la barre latérale : changer de section est
       une vraie visite Inertia, plus un changement d'état local. On intercepte
       donc la navigation pour ne pas laisser des modifications disparaître sans
       un mot — le formulaire est reconstruit à l'arrivée. */
    const dirtyRef = useRef(isDirty);
    dirtyRef.current = isDirty;

    useEffect(() => {
        return router.on('before', (event) => {
            const visit = event.detail.visit;

            /* L'enregistrement lui-même est une visite : il ne doit évidemment
               pas déclencher son propre garde-fou. */
            if (visit.method !== 'get' || !dirtyRef.current) return;

            const target = visit.url.toString();
            if (target === window.location.href) return;

            event.preventDefault();
            setPendingUrl(target);
        });
    }, []);

    return (
        <AdminLayout
            breadcrumbs={[{ label: 'Pages & sections' }]}
            actions={
                isDirty ? (
                    <Badge variant="outline" className="gap-1.5">
                        <span
                            className="admin-dot admin-dot-warning"
                            aria-hidden="true"
                        />
                        Non enregistré
                    </Badge>
                ) : undefined
            }
        >
            <Head title="Contenu du site" />

            <PageTitle
                title="Contenu du site"
                description="Modifiez les textes et les images des pages publiques. Les changements sont visibles immédiatement."
            />

            {/* Le sommaire des sections est remonté dans la barre latérale de
                l'administration : la page n'a plus de navigation propre et le
                formulaire prend toute la largeur. */}
            <form key={activeSection} onSubmit={handleSubmit}>
                <Card className="gap-0 p-0">
                    <header className="border-border border-b px-5 py-4">
                        <h2 className="admin-section-title">
                            {currentSchema.label}
                        </h2>
                        {currentSchema.description ? (
                            <p className="text-muted-foreground mt-1 text-sm">
                                {currentSchema.description}
                            </p>
                        ) : null}
                    </header>

                    {fields.length === 0 ? (
                        <EmptyState
                            icon={FileQuestion}
                            title="Aucun champ"
                            description="Cette section n'expose encore aucun champ éditable dans config/cms.php."
                        />
                    ) : (
                        <>
                            {headerFields.length > 0 && (
                                <div className="grid gap-5 px-5 py-5 sm:grid-cols-2">
                                    {headerFields.map(([key, field]) => (
                                        <div
                                            key={key}
                                            className={cn(
                                                'space-y-2',
                                                /* Un intitulé court occupe
                                                       une demi-largeur ; un
                                                       paragraphe ou une image
                                                       prend la ligne entière. */
                                                WIDE_TYPES.has(field.type)
                                                    ? 'sm:col-span-2'
                                                    : '',
                                            )}
                                        >
                                            <label
                                                htmlFor={`cms-${key}`}
                                                className="text-foreground block text-sm font-medium"
                                            >
                                                {field.label}
                                            </label>

                                            {field.help ? (
                                                <p className="admin-meta">
                                                    {field.help}
                                                </p>
                                            ) : null}

                                            <CmsField
                                                id={`cms-${key}`}
                                                schema={field}
                                                value={data.data[key] ?? ''}
                                                onChange={(value) =>
                                                    setField(key, value)
                                                }
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}

                            {listFields.map(([key, field]) => (
                                <section
                                    key={key}
                                    className="border-border space-y-3 border-t px-5 py-5"
                                    aria-label={field.label}
                                >
                                    <div>
                                        <h3 className="text-foreground text-sm font-medium">
                                            {field.label}
                                        </h3>
                                        {field.help ? (
                                            <p className="admin-meta mt-1">
                                                {field.help}
                                            </p>
                                        ) : null}
                                    </div>

                                    <ListEditor
                                        schema={field}
                                        items={
                                            Array.isArray(data.data[key])
                                                ? (data.data[key] as CmsItem[])
                                                : []
                                        }
                                        onChange={(items) =>
                                            setField(key, items)
                                        }
                                    />
                                </section>
                            ))}
                        </>
                    )}

                    {/* Barre d'enregistrement collée au bas de la carte :
                            sur une section longue, elle reste sous les yeux
                            au lieu d'attendre la fin du défilement. */}
                    <footer className="border-border bg-card sticky bottom-0 z-10 flex items-center justify-end gap-3 border-t px-5 py-4">
                        <p className="admin-meta mr-auto">
                            {isDirty
                                ? 'Modifications non enregistrées — Ctrl/⌘ + S pour enregistrer.'
                                : 'Tout est enregistré.'}
                        </p>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={processing || !isDirty}
                        >
                            {processing ? (
                                <Loader2 className="size-4 animate-spin" />
                            ) : (
                                <Save className="size-4" />
                            )}
                            Enregistrer
                        </Button>
                    </footer>
                </Card>
            </form>

            <AlertDialog
                open={pendingUrl !== null}
                onOpenChange={(open) => !open && setPendingUrl(null)}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Abandonner les modifications ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            La section « {currentSchema?.label} » contient des
                            modifications non enregistrées. Quitter cette page
                            les supprimera.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Rester ici</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                const target = pendingUrl;
                                setPendingUrl(null);
                                /* Le garde-fou lit `dirtyRef` : on le baisse
                                   avant de relancer la visite, sinon elle se
                                   ferait intercepter une seconde fois. */
                                dirtyRef.current = false;
                                if (target) router.visit(target);
                            }}
                        >
                            Abandonner
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AdminLayout>
    );
}
