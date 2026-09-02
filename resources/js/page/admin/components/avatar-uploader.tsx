import { ImagePlus } from 'lucide-react';
import React, { useRef } from 'react';

interface AvatarProps {
    image: string;
    onCallBack: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

/** Sélecteur de photo de profil : cadre neutre, aucune couleur de marque. */
export const AvatarUploader: React.FC<AvatarProps> = ({
    image,
    onCallBack,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-center gap-3">
            <button
                type="button"
                onClick={handleAvatarClick}
                aria-label="Choisir une photo de profil"
                className="border-input hover:border-muted-foreground size-32 overflow-hidden border"
            >
                {image ? (
                    <img
                        src={image}
                        alt="Photo de profil"
                        className="size-full object-cover"
                    />
                ) : (
                    <span className="bg-muted text-muted-foreground flex size-full items-center justify-center">
                        <ImagePlus className="size-6" aria-hidden="true" />
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

            {!image && (
                <p className="text-muted-foreground text-xs">
                    Ajouter une photo
                </p>
            )}
        </div>
    );
};
