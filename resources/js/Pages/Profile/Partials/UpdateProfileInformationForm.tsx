import { FieldError } from '@/components/admin/primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Link, useForm, usePage } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
}: {
    mustVerifyEmail: boolean;
    status?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            email: user.email,
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        patch(route('profile.update'));
    };

    const needsVerification =
        mustVerifyEmail && user.email_verified_at === null;

    return (
        <form onSubmit={submit} className="max-w-md space-y-5">
            <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                    id="name"
                    value={data.name}
                    onChange={(e) => setData('name', e.target.value)}
                    required
                    autoComplete="name"
                    aria-invalid={Boolean(errors.name)}
                />
                <FieldError>{errors.name}</FieldError>
            </div>

            <div className="space-y-2">
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    required
                    autoComplete="username"
                    aria-invalid={Boolean(errors.email)}
                />
                <FieldError>{errors.email}</FieldError>
            </div>

            {/* Adresse non vérifiée : un filet et une pastille d'avertissement,
                pas un aplat de couleur sur toute la largeur. */}
            {needsVerification && (
                <div className="border-border space-y-2 border p-3">
                    <p className="flex items-center gap-2 text-sm">
                        <span
                            className="admin-dot admin-dot-warning"
                            aria-hidden="true"
                        />
                        Votre adresse e-mail n'est pas vérifiée.
                    </p>

                    <Link
                        href={route('verification.send')}
                        method="post"
                        as="button"
                        className="text-foreground text-sm underline underline-offset-4"
                    >
                        Renvoyer l'e-mail de vérification
                    </Link>

                    {status === 'verification-link-sent' && (
                        <p className="admin-meta flex items-center gap-1.5">
                            <Check className="size-3.5" aria-hidden="true" />
                            Un nouveau lien vient d'être envoyé.
                        </p>
                    )}
                </div>
            )}

            <div className="flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing && <Loader2 className="size-4 animate-spin" />}
                    Enregistrer
                </Button>

                {recentlySuccessful && (
                    <p className="admin-meta flex items-center gap-1.5">
                        <Check className="size-3.5" aria-hidden="true" />
                        Enregistré
                    </p>
                )}
            </div>
        </form>
    );
}
