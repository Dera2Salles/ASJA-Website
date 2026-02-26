import type { Result } from '@/core/result';
import type { PostDto } from './post.dto';
import type { GetPostInputType, PostEntity } from './post.entity';

export abstract class PostRepository {
    abstract create(post: PostEntity): Promise<Result<PostDto>>;
    abstract get(params: GetPostInputType): Promise<Result<PostDto[]>>;
    abstract sendFiles(file: FormData): Promise<Result<void>>;
    abstract delete(id: string, fileName: string): Promise<Result<void>>;
}
