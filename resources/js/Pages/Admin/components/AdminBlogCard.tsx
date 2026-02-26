import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { Link } from '@inertiajs/react';
import { Calendar, Edit, Eye, FileText, Trash2 } from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    cover_image: string | null;
    is_published: boolean;
    created_at: string;
    category?: string;
}

interface AdminBlogCardProps {
    post: Post;
    onDelete: (id: number) => void;
}

export function AdminBlogCard({ post, onDelete }: AdminBlogCardProps) {
    return (
        <Card className="group glass relative overflow-hidden rounded-[2rem] border-none transition-all hover:-translate-y-2 hover:shadow-2xl">
            <div className="relative m-2 aspect-[16/10] overflow-hidden rounded-[1.5rem]">
                {post.cover_image ? (
                    <img
                        src={`/storage/${post.cover_image}`}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-slate-100 dark:bg-slate-800">
                        <FileText
                            className="h-12 w-12 text-slate-300 dark:text-slate-700"
                            strokeWidth={1}
                        />
                    </div>
                )}

                {}
                <div className="absolute top-3 left-3 z-10">
                    <Badge
                        className={cn(
                            'border-none px-4 py-1.5 text-[10px] font-black tracking-widest uppercase shadow-2xl backdrop-blur-xl',
                            post.is_published
                                ? 'bg-asja-green-500/90 text-white'
                                : 'bg-amber-500/90 text-white',
                        )}
                    >
                        {post.is_published ? 'Publié' : 'Brouillon'}
                    </Badge>
                </div>

                {}
                <div className="bg-asja-green-900/20 absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                    <Link href={route('blog.show', post.slug)} target="_blank">
                        <Button className="text-asja-green-900 scale-90 rounded-full bg-white shadow-2xl transition-all duration-500 group-hover:scale-100 hover:bg-white/90">
                            <Eye size={18} className="mr-2" />
                            Aperçu
                        </Button>
                    </Link>
                </div>
            </div>

            <CardContent className="p-6 pt-2">
                <div className="text-asja-green-600 dark:text-primary/80 mb-4 flex items-center gap-3 text-[10px] font-black tracking-[3px] uppercase">
                    <div className="bg-asja-green-500 h-3 w-1 rounded-full" />
                    {post.category || 'Général'}
                </div>

                <h3 className="group-hover:text-asja-green-600 dark:group-hover:text-primary mb-4 line-clamp-2 min-h-[3rem] text-xl leading-tight font-black text-slate-900 transition-colors dark:text-white">
                    {post.title}
                </h3>

                <div className="relative z-10 mt-2 flex items-center justify-between border-t border-slate-100 pt-6 dark:border-white/5">
                    <div className="text-muted-foreground flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black tracking-widest uppercase dark:bg-white/5">
                        <Calendar
                            size={12}
                            strokeWidth={3}
                            className="text-asja-green-500"
                        />
                        {new Date(post.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                        })}
                    </div>

                    <div className="flex gap-2">
                        <Link href={route('admin.blog.edit', post.id)}>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="hover:text-asja-green-600 dark:hover:text-primary hover:bg-asja-green-50 dark:hover:bg-primary/10 h-10 w-10 rounded-2xl p-0 text-slate-400 transition-all hover:scale-110 active:scale-90"
                            >
                                <Edit size={18} strokeWidth={2.5} />
                            </Button>
                        </Link>
                        <button
                            type="button"
                            className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-400 transition-all hover:rotate-12 hover:bg-rose-50 hover:text-rose-600 active:scale-90 dark:hover:bg-rose-950/30"
                            onClick={() => onDelete(post.id)}
                        >
                            <Trash2 size={18} strokeWidth={2.5} />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
