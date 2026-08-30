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
                    <div className="bg-primary text-primary-foreground border-border mx-auto flex h-16 w-16 items-center justify-center border">
                        <MailCheck size={32} />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-black tracking-tight text-foreground dark:text-white uppercase">
                            Vérifiez votre <span className="text-primary">Email</span>
                        </h2>
                        <p className="px-4 text-[10px] leading-relaxed font-black tracking-widest text-muted-foreground uppercase">
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
                        className="bg-background border border-primary text-primary flex items-center gap-3 p-4 text-sm font-bold"
                    >
                        <Send className="h-4 w-4" />
                        Un nouveau lien de vérification a été envoyé.
                    </motion.div>
                )}

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-4 pt-2">
                        <Button
                            disabled={processing}
                            className="h-12 bg-primary border border-border hover:bg-background hover:text-primary text-primary-foreground font-black uppercase tracking-widest flex gap-3 group/btn"
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
                                className="group/logout flex items-center gap-2 text-[10px] font-black tracking-widest text-muted-foreground uppercase transition-colors hover:text-primary"
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
