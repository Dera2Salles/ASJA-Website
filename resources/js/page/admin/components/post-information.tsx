import logo from '@/assets/Logo/asja-logo.png';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';
import { useModalContext } from '../bloc/useModalContext';

export const PostInformation = () => {
    const { closePostInformation, post } = useModalContext();

    return (
        <Card className="max-h-[85vh] w-full max-w-lg gap-0 overflow-y-auto p-0">
            <header className="border-border bg-card sticky top-0 flex items-center justify-between gap-3 border-b px-5 py-4">
                <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="size-8">
                        <AvatarImage src={logo} alt="" />
                    </Avatar>
                    <p className="text-foreground truncate text-sm font-medium">
                        {post?.title}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={closePostInformation}
                    aria-label="Fermer l'annonce"
                    className="text-muted-foreground hover:bg-accent hover:text-foreground inline-flex size-8 shrink-0 items-center justify-center"
                >
                    <X className="size-4" aria-hidden="true" />
                </button>
            </header>

            <div className="space-y-4 px-5 py-5">
                {post?.imageUrl && (
                    <div className="border-border aspect-[16/9] overflow-hidden border">
                        <img
                            src={post.imageUrl}
                            alt=""
                            className="size-full object-cover"
                        />
                    </div>
                )}

                <p className="text-foreground text-sm whitespace-pre-line">
                    {post?.description}
                </p>

                <p className="admin-meta">Publié le {post?.date}</p>
            </div>
        </Card>
    );
};
