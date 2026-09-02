import { StatusBadge } from '@/components/admin/primitives';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { UserDto } from '@/features/mention/user.dto';
import { User, X } from 'lucide-react';
import { useModalContext } from '../bloc/useModalContext';

/** Ligne « libellé / valeur » d'une fiche : le libellé reste gris et discret. */
const Field = ({ label, value }: { label: string; value?: string }) => (
    <div className="flex items-baseline justify-between gap-4">
        <span className="admin-label shrink-0">{label}</span>
        <span className="text-foreground min-w-0 truncate text-sm">
            {value || '—'}
        </span>
    </div>
);

export const StudentInformation = ({ student }: { student: UserDto }) => {
    const { closeStudentInfo } = useModalContext();

    return (
        <Card className="w-full max-w-lg gap-0 p-0">
            <header className="border-border flex items-center justify-between gap-3 border-b px-5 py-4">
                <p className="text-foreground text-sm font-medium">
                    Fiche étudiant
                </p>
                <button
                    type="button"
                    onClick={closeStudentInfo}
                    aria-label="Fermer la fiche"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 items-center justify-center"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </header>

            <div className="flex items-center gap-4 px-5 py-5">
                <Avatar className="size-16">
                    <AvatarImage src={student.imageUrl} alt="" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="size-6" aria-hidden="true" />
                    </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                    <p className="admin-section-title truncate">
                        {student.name} {student.lastName}
                    </p>
                    <p className="admin-mono text-muted-foreground mt-0.5">
                        {student.identifier}
                    </p>
                </div>
            </div>

            <Separator />

            <div className="space-y-3 px-5 py-5">
                <Field label="Contact" value={student.contact} />
                <Field label="Mention" value={student.mention} />
                <Field label="Niveau" value={student.level} />
                <Field label="Branche" value={student.branche} />
            </div>

            <Separator />

            <div className="flex flex-wrap items-center gap-2 px-5 py-4">
                <span className="admin-label mr-1">Tranches</span>
                <StatusBadge tone={student.Premier ? 'success' : 'danger'}>
                    1re
                </StatusBadge>
                <StatusBadge tone={student.Deuxieme ? 'success' : 'danger'}>
                    2e
                </StatusBadge>
                <StatusBadge tone={student.Troisieme ? 'success' : 'danger'}>
                    3e
                </StatusBadge>
            </div>
        </Card>
    );
};
