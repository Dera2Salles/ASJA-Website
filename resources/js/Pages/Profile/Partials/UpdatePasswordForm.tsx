import { FieldError } from '@/components/admin/primitives';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Check, Loader2 } from 'lucide-react';
import { FormEventHandler, useRef } from 'react';

export default function UpdatePasswordForm() {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current?.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current?.focus();
                }
            },
        });
    };

    return (
        <form onSubmit={updatePassword} className="max-w-md space-y-5">
            <div className="space-y-2">
                <Label htmlFor="current_password">Mot de passe actuel</Label>
                <Input
                    id="current_password"
                    ref={currentPasswordInput}
                    type="password"
                    value={data.current_password}
                    onChange={(e) =>
                        setData('current_password', e.target.value)
                    }
                    autoComplete="current-password"
                    aria-invalid={Boolean(errors.current_password)}
                />
                <FieldError>{errors.current_password}</FieldError>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password">Nouveau mot de passe</Label>
                <Input
                    id="password"
                    ref={passwordInput}
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password)}
                />
                <FieldError>{errors.password}</FieldError>
            </div>

            <div className="space-y-2">
                <Label htmlFor="password_confirmation">
                    Confirmer le nouveau mot de passe
                </Label>
                <Input
                    id="password_confirmation"
                    type="password"
                    value={data.password_confirmation}
                    onChange={(e) =>
                        setData('password_confirmation', e.target.value)
                    }
                    autoComplete="new-password"
                    aria-invalid={Boolean(errors.password_confirmation)}
                />
                <FieldError>{errors.password_confirmation}</FieldError>
            </div>

            <div className="flex items-center gap-3 pt-1">
                <Button type="submit" size="sm" disabled={processing}>
                    {processing && <Loader2 className="size-4 animate-spin" />}
                    Mettre à jour
                </Button>

                {recentlySuccessful && (
                    <p className="admin-meta flex items-center gap-1.5">
                        <Check className="size-3.5" aria-hidden="true" />
                        Mot de passe mis à jour
                    </p>
                )}
            </div>
        </form>
    );
}
