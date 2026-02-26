import React, { useRef } from 'react';

interface AvatarProps {
    image: string;
    onCallBack: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export const UploadAndViewImage: React.FC<AvatarProps> = ({
    image,
    onCallBack,
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="flex flex-col items-start gap-2">
            <div
                className="group relative w-full cursor-pointer"
                onClick={handleAvatarClick}
            >
                {image ? (
                    <div className="aspect-[16/9]">
                        {' '}
                        <img
                            src={image}
                            alt={image}
                            className="h-100 w-full rounded-2xl border-2 border-gray-200 transition-all duration-200"
                        />{' '}
                    </div>
                ) : (
                    <label
                        htmlFor="file-upload"
                        className="flex w-full cursor-pointer rounded-2xl bg-gray-100 p-2 dark:bg-zinc-800"
                    >
                        <p className="p-1 text-center text-lg text-gray-600">
                            {' '}
                            {image ? '' : 'Cliquez pour ajouter une image'}{' '}
                        </p>
                    </label>
                )}
            </div>
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
