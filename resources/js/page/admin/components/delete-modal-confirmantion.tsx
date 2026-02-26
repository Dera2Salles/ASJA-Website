import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { MdWarning } from 'react-icons/md';

export const DeleteModalConfirmation = ({
    text,
    cancel,
    confirm,
}: {
    text: string;
    cancel: () => void;
    confirm: () => Promise<void>;
}) => {
    return (
        <div className="flex w-1/3 flex-col gap-5">
            <Card className="items-center border-l-5 border-l-red-600 p-5 transition-all duration-500">
                <MdWarning className="text-7xl text-red-600 dark:text-white" />
                <p className="font-semibold">{text}</p>
                <section className="flex justify-end gap-3">
                    <Button
                        onClick={cancel}
                        className="cursor-pointer bg-gray-400 dark:bg-gray-300 dark:hover:bg-gray-200"
                    >
                        Annuler
                    </Button>
                    <Button
                        onClick={confirm}
                        className="cursor-pointer bg-red-600 text-white hover:bg-red-700"
                    >
                        Supprimer
                    </Button>
                </section>
            </Card>
        </div>
    );
};
