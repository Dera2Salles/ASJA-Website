import Modal from '@/Components/Modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { FormEventHandler, useRef, useState } from 'react';

export default function DeleteUserForm({
    className = '',
}: {
    className?: string;
}) {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
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

    const confirmUserDeletion = () => {
        setConfirmingUserDeletion(true);
    };

    const deleteUser: FormEventHandler = (e) => {
        e.preventDefault();

        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => closeModal(),
            onError: () => passwordInput.current?.focus(),
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <div className="space-y-4">
                <p className="text-sm leading-relaxed font-medium text-slate-500 dark:text-zinc-400">
                    Une fois votre compte supprimé, toutes ses ressources et
                    données seront définitivement effacées. Avant de supprimer
                    votre compte, veuillez télécharger toutes les données ou
                    informations que vous souhaitez conserver.
                </p>

                <Button
                    variant="destructive"
                    onClick={confirmUserDeletion}
                    className="flex h-12 gap-2 rounded-xl bg-rose-600 px-8 font-black text-white shadow-xl shadow-rose-900/20 transition-all hover:bg-rose-700"
                >
                    <Trash2 size={18} />
                    Supprimer définitivement mon compte
                </Button>
            </div>

            <Modal show={confirmingUserDeletion} onClose={closeModal}>
                <form
                    onSubmit={deleteUser}
                    className="relative overflow-hidden bg-white p-8 md:p-12 dark:bg-zinc-950"
                >
                    {}
                    <div className="absolute top-0 right-0 -mt-16 -mr-16 h-32 w-32 rounded-full bg-rose-500/10 blur-3xl" />

                    <div className="relative space-y-8">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-950/30">
                                    <AlertTriangle size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                        Confirmation critique
                                    </h2>
                                    <p className="text-sm font-medium text-slate-500">
                                        Action irréversible
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={closeModal}
                                className="rounded-xl hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                <X size={20} />
                            </Button>
                        </div>

                        <p className="text-sm leading-relaxed font-medium text-slate-600 dark:text-zinc-400">
                            Êtes-vous sûr de vouloir supprimer votre compte ?
                            Toutes les données seront perdues. Veuillez saisir
                            votre mot de passe pour confirmer cette action.
                        </p>

                        <div className="space-y-3">
                            <Label
                                htmlFor="password"
                                className="ml-1 text-[10px] font-black tracking-widest text-slate-400 uppercase"
                            >
                                Mot de passe de confirmation
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                name="password"
                                ref={passwordInput}
                                value={data.password}
                                onChange={(e) =>
                                    setData('password', e.target.value)
                                }
                                className="h-12 rounded-xl border-none bg-slate-50 px-4 font-bold focus:ring-2 focus:ring-rose-500/20 dark:bg-white/5"
                                placeholder="Saisissez votre mot de passe..."
                                autoFocus
                            />
                            {errors.password && (
                                <p className="flex items-center gap-1 text-[10px] font-black tracking-tight text-rose-500 uppercase">
                                    <AlertTriangle size={10} />{' '}
                                    {errors.password}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={closeModal}
                                className="h-12 flex-1 rounded-xl font-black text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5"
                            >
                                Annuler
                            </Button>
                            <Button
                                type="submit"
                                variant="destructive"
                                disabled={processing}
                                className="flex h-12 flex-1 gap-2 rounded-xl bg-rose-600 font-black text-white shadow-xl shadow-rose-900/20 transition-all hover:scale-[1.02] hover:bg-rose-700"
                            >
                                {processing && (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                )}
                                Confirmer la suppression
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>
        </section>
    );
}
