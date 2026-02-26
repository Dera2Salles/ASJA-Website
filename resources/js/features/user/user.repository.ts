import type { Result } from '@/core/result';
import type { UpdateDto } from './udpate.dto';
import type { UserDto } from './user.dto';

export abstract class UserRepository {
    abstract getData(): Promise<Result<UserDto>>;
    abstract update(user: UpdateDto): Promise<Result<UpdateDto>>;
}
