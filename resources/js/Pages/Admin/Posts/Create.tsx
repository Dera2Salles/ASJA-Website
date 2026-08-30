import AdminLayout from '@/Layouts/AdminLayout';
import { Head } from '@inertiajs/react';
import { PostForm } from './PostForm';

export default function PostCreate() {
    return (
        <AdminLayout>
            <Head title="Nouvelle publication" />
            <PostForm />
        </AdminLayout>
    );
}
