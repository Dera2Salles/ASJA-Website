import { Button } from '@/components/ui/button';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { Loader2, LogOut, MailCheck, Send } from 'lucide-react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Vérification de l'email" />

            <div className="space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4 text-center"
                >
                    <div className="bg-asja-green-50 dark:bg-asja-green-900/10 text-asja-green-600 dark:text-asja-green-400 mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                        <MailCheck size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">
                            Vérifiez votre <span className="text-asja-green-600">Email</span>
                        </h2>
                        <p className="px-4 text-[10px] leading-relaxed font-black tracking-widest text-slate-400 uppercase">
                            Merci de votre inscription ! Avant de commencer,
                            veuillez vérifier votre adresse email en cliquant
                            sur le lien que nous venons de vous envoyer.
                        </p>
                    </div>
                </motion.div>

                {status === 'verification-link-sent' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-asja-green-50 dark:bg-asja-green-900/10 border border-asja-green-100 dark:border-asja-green-900/20 text-asja-green-700 dark:text-asja-green-400 animate-in fade-in flex items-center gap-3 rounded-2xl p-4 text-sm font-bold"
                    >
                        <Send className="h-4 w-4" />
                        Un nouveau lien de vérification a été envoyé.
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4 pt-2">
                        <Button
                            disabled={processing}
                            className="h-12 rounded-xl bg-asja-green-600 hover:bg-asja-green-700 text-white font-black uppercase tracking-widest shadow-xl shadow-asja-green-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex gap-3 group/btn"
                        >
                            {processing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <>
                                    <span>Renvoyer l'email</span>
                                    <Send className="h-4 w-4 ml-auto opacity-0 -translate-x-4 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
                                </>
                            )}
                        </Button>

                        <div className="flex justify-center">
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="group/logout flex items-center gap-2 text-[10px] font-black tracking-widest text-slate-400 uppercase transition-colors hover:text-asja-green-600"
                            >
                                <LogOut className="h-4 w-4 transition-transform group-hover/logout:translate-x-1" />
                                Se déconnecter
                            </Link>
                        </div>
                    </div>
                </form>
            </div>
        </GuestLayout>
    );
}
