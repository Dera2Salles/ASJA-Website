import AdminLayout from '@/Layouts/AdminLayout';
import type { Post } from '@/lib/posts';
import { Head } from '@inertiajs/react';
import { PostForm } from './PostForm';

export default function PostEdit({ post }: { post: Post }) {
    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Publications', href: route('admin.posts.index') },
                { label: 'Modifier' },
            ]}
        >
            <Head title={`Modifier — ${post.title}`} />
            <PostForm post={post} />
        </AdminLayout>
    );
}
