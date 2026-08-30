import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { PostForm } from './PostForm';

export default function PostCreate() {
    return (
        <AdminLayout
            breadcrumbs={[
                { label: 'Publications', href: route('admin.posts.index') },
                { label: 'Nouvelle' },
            ]}
        >
            <Head title="Nouvelle publication" />
            <PostForm />
        </AdminLayout>
    );
}
