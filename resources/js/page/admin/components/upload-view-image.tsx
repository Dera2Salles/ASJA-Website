import { ImagePlus } from 'lucide-react';
import React, { useRef } from 'react';

interface AvatarProps {
    image: string;
    onCallBack: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Illustration d'une annonce : zone de dépôt neutre, ratio 16/9. */
export const UploadAndViewImage: React.FC<AvatarProps> = ({
    image,
    onCallBack,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={handleAvatarClick}
                aria-label="Choisir une image d'illustration"
                className="border-input hover:border-muted-foreground block aspect-[16/9] w-full overflow-hidden border border-dashed"
            >
                {image ? (
                    <img
                        src={image}
                        alt=""
                        className="size-full object-cover"
                    />
                ) : (
                    <span className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 text-sm">
                        <ImagePlus className="size-5" aria-hidden="true" />
                        Cliquez pour ajouter une image
                    </span>
                )}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onCallBack}
                className="hidden"
            />
        </div>
    );
};
