import { Card } from '@/components/ui/card';

import type { UserDto } from '@/features/mention/user.dto';
import { MdCancel, MdPerson } from 'react-icons/md';
import { useModalContext } from '../bloc/useModalContext';

export const StudentInformation = ({ student }: { student: UserDto }) => {
    const { closeStudentInfo } = useModalContext();

    return (
        <div className="flex w-1/3 flex-col gap-5">
            <Card className="border-l-4 border-l-green-600 p-5 transition-all duration-500">
                <MdCancel
                    onClick={() => {
                        closeStudentInfo();
                    }}
                    className="absolute cursor-pointer text-4xl text-green-600 transition-all duration-300 hover:scale-125 dark:text-white"
                />
                <section className="flex justify-center">
                    <p className="text-2xl font-bold text-green-600">
                        Etudiant
                    </p>
                </section>
                <section className="flex justify-center gap-12 px-5 pb-7">
                    {student.imageUrl ? (
                        <div className="rounded-full border-5 border-green-700 p-1">
                            <img
                                src={student.imageUrl}
                                alt="Photo de profil"
                                className="size-50 rounded-full object-cover transition-all duration-200"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center rounded-full bg-gradient-to-br from-zinc-400 to-zinc-500 font-semibold text-white">
                            <MdPerson className="z-100 size-50 p-2" />
                        </div>
                    )}
                    <section className="flex flex-col justify-center gap-1 font-semibold">
                        <p>
                            Nom :{' '}
                            <span className="font-normal">
                                {student.name}
                            </span>{' '}
                        </p>
                        <p>
                            Prenom :{' '}
                            <span className="font-normal">
                                {student.lastName}
                            </span>{' '}
                        </p>
                        <p>
                            Matricule:
                            <span className="font-normal">
                                {' '}
                                {student.identifier}
                            </span>{' '}
                        </p>
                        <p>
                            Contact:{' '}
                            <span className="font-normal">
                                {' '}
                                {student.contact}
                            </span>{' '}
                        </p>
                        <p>
                            Niveau:{' '}
                            <span className="font-normal">
                                {' '}
                                {student.level}
                            </span>
                        </p>
                        <p>
                            Mention :{' '}
                            <span className="font-normal">
                                {' '}
                                {student.mention}
                            </span>{' '}
                        </p>
                        <p>
                            Branche:{' '}
                            <span className="font-normal">
                                {' '}
                                {student.branche}
                            </span>{' '}
                        </p>
                    </section>
                </section>
            </Card>
        </div>
    );
};
