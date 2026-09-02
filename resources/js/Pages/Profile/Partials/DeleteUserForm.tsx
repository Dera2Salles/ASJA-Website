import { FieldError } from '@/components/admin/primitives';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { Loader2 } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm() {
    const [confirming, setConfirming] = useState(false);
    const passwordInput = useRef<HTMLInputElement>(null);

    const {
        data,
        setData,
        delete: destroy,
        processing,
        reset,
        errors,
        clearErrors,
    } = useForm({
        password: '',
    });

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeDialog(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeDialog = () => {
        setConfirming(false);
        clearErrors();
        reset();
    };

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground max-w-prose text-sm">
                Une fois le compte supprimé, toutes ses données sont effacées
                définitivement. Téléchargez au préalable ce que vous souhaitez
                conserver.
            </p>

            <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => setConfirming(true)}
            >
                Supprimer mon compte
            </Button>

            <AlertDialog
                open={confirming}
                onOpenChange={(open) => !open && closeDialog()}
            >
                <AlertDialogContent>
                    {/* Le formulaire vit dans la boîte de dialogue : la touche
                        Entrée depuis le champ vaut confirmation. */}
                    <form onSubmit={deleteUser} className="space-y-4">
                        <AlertDialogHeader>
                            <AlertDialogTitle>
                                Supprimer définitivement ce compte ?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                                Cette action est irréversible. Saisissez votre
                                mot de passe pour confirmer.
                            </AlertDialogDescription>
                        </AlertDialogHeader>

                        <div className="space-y-2">
                            <Label htmlFor="delete_password">
                                Mot de passe
                            </Label>
                            <Input
                                id="delete_password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                autoComplete="current-password"
                                aria-invalid={Boolean(errors.password)}
                                autoFocus
                            />
                            <FieldError>{errors.password}</FieldError>
                        </div>

                        <AlertDialogFooter>
                            <AlertDialogCancel type="button">
                                Annuler
                            </AlertDialogCancel>
                            {/* Bouton natif plutôt que `AlertDialogAction` : la
                                boîte ne doit se fermer que si le serveur
                                accepte le mot de passe. */}
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                            >
                                {processing && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                Supprimer le compte
                            </Button>
                        </AlertDialogFooter>
                    </form>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
