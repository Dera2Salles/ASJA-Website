import { Alert, AlertDescription } from '@/components/ui/alert';
import { BellRing } from 'lucide-react';
import { useLandingContext } from '../bloc/useLandingContext';

export const AnnonceSection = () => {
    const { isAnnonce, annonce } = useLandingContext();
    if (isAnnonce)
        return (
            <div className="flex w-full">
                <Alert className="flex w-full justify-center border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                    <BellRing className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                        {annonce}
                    </AlertDescription>
                </Alert>
            </div>
        );
    return null;
};
