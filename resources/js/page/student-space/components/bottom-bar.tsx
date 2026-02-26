import { motion } from 'framer-motion';
import { CircleUserRound, FileText, LayoutGrid } from 'lucide-react';
import { type Dispatch, type SetStateAction } from 'react';

const navItems = [
    { icon: LayoutGrid, label: 'Accueil' },
    { icon: FileText, label: 'Documents' },
    { icon: CircleUserRound, label: 'Profil' },
];

export const BottomBar = ({
    callBack,
    index,
}: {
    callBack: Dispatch<SetStateAction<number>>;
    index: number;
}) => {
    return (
        <div className="mt-2 flex w-full justify-center md:hidden">
            <div className="relative flex h-16 w-full max-w-xs items-center justify-around rounded-full border border-white/10 bg-white/10 shadow-lg backdrop-blur-lg dark:bg-black/20">
                {navItems.map((item, i) => (
                    <button
                        key={i}
                        onClick={() => callBack(i)}
                        className="relative z-10 flex h-full flex-1 items-center justify-center rounded-full focus:outline-none"
                        aria-label={item.label}
                    >
                        <item.icon
                            className={`size-6 transition-colors duration-300 ${
                                index === i ? 'text-white' : 'text-gray-300'
                            }`}
                        />
                        {index === i && (
                            <motion.div
                                className="absolute inset-2 z-[-1] rounded-full bg-green-700/60"
                                layoutId="active-pill"
                                transition={{
                                    duration: 0.6,
                                    type: 'spring',
                                    bounce: 0.25,
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
