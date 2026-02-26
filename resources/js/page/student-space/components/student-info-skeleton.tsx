import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const StudentInfoSkeleton = () => {
    return (
        <div className="flex w-full flex-col md:w-1/3">
            <Card className="h-full border-0 bg-transparent shadow-none transition-all duration-500">
                <div className="space-y-4 p-4">
                    <div className="flex flex-col items-center justify-center">
                        <Skeleton className="size-48 rounded-full" />
                    </div>
                    <div className="flex flex-col items-center space-y-2">
                        <Skeleton className="h-6 w-40" />
                        <div className="flex gap-3 pt-4">
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                        <Skeleton className="h-4 w-48 pt-2" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
            </Card>
        </div>
    );
};
