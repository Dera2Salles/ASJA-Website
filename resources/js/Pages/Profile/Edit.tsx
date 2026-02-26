import AdminLayout from '@/Layouts/AdminLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { motion } from 'framer-motion';
import { ShieldCheck, Trash2, User } from 'lucide-react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AdminLayout>
            <Head title="Mon Profil" />

            <div className="mx-auto max-w-5xl space-y-12 pb-20">
                {}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2"
                >
                    <h1 className="text-4xl font-black tracking-tight text-slate-900 lg:text-5xl dark:text-white">
                        Gestion du{' '}
                        <span className="text-asja-green-600 dark:text-primary">
                            Profil
                        </span>
                    </h1>
                    <p className="font-medium text-slate-500 dark:text-zinc-400">
                        Personnalisez vos informations et sécurisez votre accès.
                    </p>
                </motion.div>

                <div className="grid gap-10">
                    {}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 }}
                        className="glass overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl dark:bg-zinc-950/50"
                    >
                        <div className="p-8 md:p-12">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="bg-asja-green-100 dark:bg-primary/10 text-asja-green-600 dark:text-primary flex h-12 w-12 items-center justify-center rounded-2xl">
                                    <User size={24} />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                    Informations Personnelles
                                </h2>
                            </div>
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                            />
                        </div>
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="glass overflow-hidden rounded-[2.5rem] border-none bg-white shadow-2xl dark:bg-zinc-950/50"
                    >
                        <div className="p-8 md:p-12">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 dark:bg-amber-400/10 dark:text-amber-400">
                                    <ShieldCheck size={24} />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-slate-900 uppercase dark:text-white">
                                    Sécurité du Compte
                                </h2>
                            </div>
                            <UpdatePasswordForm />
                        </div>
                    </motion.div>

                    {}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.3 }}
                        className="overflow-hidden rounded-[2.5rem] border border-none border-rose-100/50 bg-rose-50/50 shadow-xl dark:border-rose-900/20 dark:bg-rose-950/10"
                    >
                        <div className="p-8 md:p-12">
                            <div className="mb-10 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 dark:bg-rose-600/10">
                                    <Trash2 size={24} />
                                </div>
                                <h2 className="text-xl font-black tracking-tight text-rose-600 uppercase">
                                    Zone de Danger
                                </h2>
                            </div>
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </motion.div>
                </div>
            </div>

            {}
            <div className="bg-asja-green-500/[0.03] pointer-events-none fixed top-[10%] right-[-5%] -z-10 h-[500px] w-[500px] rounded-full blur-[120px]" />
            <div className="bg-primary/[0.02] pointer-events-none fixed bottom-[10%] left-[-5%] -z-10 h-[400px] w-[400px] rounded-full blur-[100px]" />
        </AdminLayout>
    );
}
