import { Card } from '@/components/ui/card';

import { Avatar } from '@/components/ui/avatar';
import { MdCancel } from 'react-icons/md';
import { useModalContext } from '../bloc/useModalContext';

import logo from '@/assets/Logo/asja-logo.png';

export const PostInformation = () => {
    const { closePostInformation, post } = useModalContext();

    return (
        <div className="flex w-1/3 flex-col gap-5">
            <MdCancel
                onClick={() => {
                    closePostInformation();
                }}
                className="relative top-5 right-10 cursor-pointer text-4xl text-white transition-all duration-300 hover:scale-125"
            />
            <Card className="p-5 transition-all duration-500">
                <section className="flex items-center gap-3">
                    <Avatar className="size-11">
                        <img src={logo} />
                    </Avatar>
                    <p className="text-xl font-semibold">{post?.title}</p>
                </section>
                <p>{post?.description}</p>
                {post?.imageUrl && (
                    <div className="aspect-[16/9]">
                        <img src={post?.imageUrl} className="rounded-2xl" />
                    </div>
                )}
                <p className="flex justify-end text-gray-500">
                    Publie le , {post?.date}
                </p>
            </Card>
        </div>
    );
};
