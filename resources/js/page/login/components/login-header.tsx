import { Img } from '@/Components/Img';
import { useLangue } from '@/page/lang/useLang';

export const LoginHeader = () => {
    const { translate, toggleLang, isEn } = useLangue();
    return (
        <div className="fixed top-3 z-20 flex w-full justify-between px-2 md:px-5">
            <a
                className="cursor-pointer"
                onClick={() => (window.location.href = '/')}
            >
                <div className="m-2 flex items-center rounded-full">
                    <Img
                        source="Logo/asja-logo"
                        alt=""
                        sizes="48px"
                        className="h-12 w-12"
                    />
                    <h1 className="ml-4 text-lg font-bold text-white drop-shadow-md">
                        {translate('universite')}
                    </h1>
                </div>
            </a>
            <div className="flex items-center">
                <button
                    className="cursor-pointer font-semibold text-white drop-shadow-md md:px-5"
                    onClick={toggleLang}
                >
                    {isEn ? 'FR' : 'EN'}
                </button>
            </div>
        </div>
    );
};
