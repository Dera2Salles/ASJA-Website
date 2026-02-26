import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';
import { useStudentPortalContext } from '../bloc/useStudentSpaceContext';
import { StudentInfoSkeleton } from './student-info-skeleton';

const PaymentBadge = ({ paid }: { paid: boolean }) => (
    <div
        className={`flex size-10 items-center justify-center rounded-full text-white shadow-lg ${
            paid ? 'bg-green-500' : 'bg-red-500'
        }`}
    >
        {paid ? <CheckCircle size={24} /> : <XCircle size={24} />}
    </div>
);

export const StudentInformation = () => {
    const { userData, isLoading } = useStudentPortalContext();

    if (isLoading) {
        return <StudentInfoSkeleton />;
    }

    return (
        <div className="h-full w-full">
            <Card className="h-full rounded-2xl border-0 bg-white/10 shadow-none backdrop-blur-lg transition-all duration-500 dark:bg-black/20">
                <div className="flex flex-col gap-6 p-6 text-white">
                    <motion.section
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                        className="flex flex-col items-center justify-center"
                    >
                        <div className="relative">
                            <img
                                src={userData?.imageUrl}
                                alt="Photo de profil"
                                className="size-48 rounded-full border-4 border-green-500 object-cover shadow-lg"
                            />
                        </div>
                    </motion.section>
                    <motion.section
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{
                            duration: 0.5,
                            delay: 0.2,
                            ease: 'easeOut',
                        }}
                        className="flex w-full flex-col items-center justify-center gap-2"
                    >
                        <h2 className="text-2xl font-bold text-black drop-shadow-lg dark:text-gray-200">
                            {userData?.name} {userData?.lastName}
                        </h2>
                        <div className="mt-4 flex w-full justify-center gap-4 py-4">
                            <PaymentBadge paid={userData?.Premier ?? false} />
                            <PaymentBadge paid={userData?.Deuxieme ?? false} />
                            <PaymentBadge paid={userData?.Troisieme ?? false} />
                        </div>
                        <div className="space-y-1 text-center text-black dark:text-gray-200">
                            <p>
                                <span className="font-semibold">Mention :</span>{' '}
                                {userData?.mention}
                            </p>
                            <p>
                                <span className="font-semibold">Branche :</span>{' '}
                                {userData?.branche}
                            </p>
                            <p>
                                <span className="font-semibold">Niveau :</span>{' '}
                                {userData?.level}
                            </p>
                            <p>
                                <span className="font-semibold">
                                    Matricule :
                                </span>{' '}
                                {userData?.identifier}
                            </p>
                        </div>
                    </motion.section>
                </div>
            </Card>
        </div>
    );
};
