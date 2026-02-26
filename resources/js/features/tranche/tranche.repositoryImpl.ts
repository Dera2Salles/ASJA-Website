import { failure, success, type Result } from '@/core/result';
import type { TrancheDto } from './tranche.dto';
import { TrancheRepository } from './tranche.repository';
import { TrancheService } from './tranche.service';

export class TrancheRepositoryImpl implements TrancheRepository {
    constructor(private service: TrancheService) {}

    async update(dto: TrancheDto): Promise<Result<void>> {
        try {
            await this.service.update(dto);
            return success(undefined);
        } catch (error) {
            console.error(error);
            return failure(new Error());
        }
    }
}
