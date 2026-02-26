import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';

interface Post {
    id: number;
    title: string;
    slug: string;
    category: string | null;
    is_published: boolean;
    published_at: string | null;
    author: { id: number; name: string };
}

interface Props {
    posts: Post[];
}

export default function BlogIndex({ posts }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Delete this blog post permanently?')) {
            router.delete(route('admin.blog.destroy', id));
        }
    };

    return (
        <AdminLayout>
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Blog Posts</h1>
                    <Link href={route('admin.blog.create')} className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                        + New Post
                    </Link>
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
                    {posts.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            No blog posts yet.{' '}
                            <Link href={route('admin.blog.create')} className="text-indigo-400 hover:underline">
                                Create your first post
                            </Link>
                        </div>
                    )}
                    {posts.map((post, i) => (
                        <div
                            key={post.id}
                            className={`flex items-center gap-4 p-4 ${i !== posts.length - 1 ? 'border-b border-gray-700' : ''}`}
                        >
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                    <span className="font-medium text-white truncate">{post.title}</span>
                                    <span
                                        className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${
                                            post.is_published
                                                ? 'bg-green-500/20 text-green-400'
                                                : 'bg-yellow-500/20 text-yellow-400'
                                        }`}
                                    >
                                        {post.is_published ? 'Published' : 'Draft'}
                                    </span>
                                </div>
                                <div className="text-xs text-gray-500">
                                    by {post.author?.name}
                                    {post.published_at &&
                                        ` · ${new Date(post.published_at).toLocaleDateString()}`}
                                    {post.category && ` · ${post.category}`}
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                {post.is_published && (
                                    <a
                                        href={route('blog.show', post.slug)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs text-gray-400 hover:text-white transition-colors px-2 py-1 bg-gray-700 rounded"
                                    >
                                        View
                                    </a>
                                )}
                                <Link
                                    href={route('admin.blog.edit', post.id)}
                                    className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors px-2 py-1 bg-indigo-400/10 rounded"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(post.id)}
                                    className="text-xs text-red-400 hover:text-red-300 transition-colors px-2 py-1 bg-red-400/10 rounded"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AdminLayout>
    );
}
