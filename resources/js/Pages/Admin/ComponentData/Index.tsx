import AdminLayout from '@/Layouts/AdminLayout';
import { Head, router, useForm } from '@inertiajs/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Loader2, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
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
}

/**
 * Édition du contenu du site.
 *
 * Le formulaire est entièrement dérivé du schéma envoyé par le serveur
 * (config/cms.php) : aucun champ n'est écrit en dur ici. Ajouter un champ au
 * schéma le fait apparaître automatiquement dans cet écran.
 */
export default function ComponentDataIndex({ schema, content }: Props) {
    const sections = Object.keys(schema);
    const [activeSection, setActiveSection] = useState(sections[0]);

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

    const currentSchema = schema[activeSection];

    const setField = (key: string, value: FieldValue) => {
        setData('data', { ...data.data, [key]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.component-data.update'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Contenu mis à jour.'),
            onError: () => toast.error("L'enregistrement a échoué."),
        });
    };

    return (
        <AdminLayout>
            <Head title="Contenu du site" />

            <div className="pb-16">
                <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <h1 className="text-foreground text-3xl">
                            Contenu du site
                        </h1>
                        <p className="text-muted-foreground mt-2 text-sm">
                            Modifiez les textes et les images des pages
                            publiques. Les changements sont visibles
                            immédiatement.
                        </p>
                    </div>

                    <button
                        onClick={() => router.visit('/')}
                        className="border-border text-foreground hover:border-primary hover:text-primary inline-flex cursor-pointer items-center gap-2 self-start rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
                    >
                        Voir le site
                        <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
                    <nav className="lg:col-span-3">
                        <div className="border-border bg-card sticky top-6 space-y-1 rounded-xl border p-2">
                            {sections.map((key) => (
                                <button
                                    key={key}
                                    onClick={() => setActiveSection(key)}
                                    className={`w-full cursor-pointer rounded-lg px-4 py-2.5 text-left text-sm font-medium transition-colors ${
                                        activeSection === key
                                            ? 'bg-primary text-primary-foreground'
                                            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                                    }`}
                                >
                                    {schema[key].label}
                                </button>
                            ))}
                        </div>
                    </nav>

                    <div className="lg:col-span-9">
                        <AnimatePresence mode="wait">
                            <motion.form
                                key={activeSection}
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -12 }}
                                transition={{ duration: 0.2 }}
                                onSubmit={handleSubmit}
                                className="border-border bg-card rounded-xl border"
                            >
                                <div className="border-border border-b px-7 py-6">
                                    <h2 className="text-foreground text-xl">
                                        {currentSchema.label}
                                    </h2>
                                    {currentSchema.description ? (
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            {currentSchema.description}
                                        </p>
                                    ) : null}
                                </div>

                                <div className="space-y-7 px-7 py-7">
                                    {Object.entries(currentSchema.fields).map(
                                        ([key, field]) => (
                                            <div
                                                key={key}
                                                className="space-y-2"
                                            >
                                                <label className="text-foreground block text-sm font-semibold">
                                                    {field.label}
                                                </label>

                                                {field.help ? (
                                                    <p className="text-muted-foreground text-xs">
                                                        {field.help}
                                                    </p>
                                                ) : null}

                                                {field.type === 'list' ? (
                                                    <ListEditor
                                                        schema={field}
                                                        items={
                                                            Array.isArray(
                                                                data.data[key],
                                                            )
                                                                ? (data.data[
                                                                      key
                                                                  ] as CmsItem[])
                                                                : []
                                                        }
                                                        onChange={(items) =>
                                                            setField(
                                                                key,
                                                                items,
                                                            )
                                                        }
                                                    />
                                                ) : (
                                                    <CmsField
                                                        schema={field}
                                                        value={
                                                            data.data[key] ?? ''
                                                        }
                                                        onChange={(value) =>
                                                            setField(key, value)
                                                        }
                                                    />
                                                )}
                                            </div>
                                        ),
                                    )}
                                </div>

                                <div className="border-border bg-muted/30 flex items-center justify-end gap-3 border-t px-7 py-5">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex cursor-pointer items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-60"
                                    >
                                        {processing ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4" />
                                        )}
                                        Enregistrer
                                    </button>
                                </div>
                            </motion.form>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
