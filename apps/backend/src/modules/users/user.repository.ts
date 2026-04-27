import { injectable } from 'tsyringe';
import type { Repository } from 'typeorm';
import { AppDataSource } from '@core/database/data-source';
import { UserEntity } from './user.entity';

export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role?: UserEntity['role'];
}

/**
 * Repository encapsulates all persistence concerns for the User aggregate.
 * The service layer depends on this class — never on TypeORM directly — so
 * we can swap the storage engine (e.g. read-replicas, sharding) without
 * touching business logic.
 */
@injectable()
export class UserRepository {
  private get repo(): Repository<UserEntity> {
    return AppDataSource.getRepository(UserEntity);
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repo.findOne({ where: { id } });
  }

  findByEmail(email: string, includePassword = false): Promise<UserEntity | null> {
    const qb = this.repo.createQueryBuilder('u').where('u.email = :email', { email });
    if (includePassword) qb.addSelect('u.passwordHash');
    return qb.getOne();
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async update(id: string, patch: Partial<UserEntity>): Promise<UserEntity | null> {
    await this.repo.update(id, patch);
    return this.findById(id);
  }

  softDelete(id: string): Promise<unknown> {
    return this.repo.softDelete(id);
  }

  list(params: { page: number; limit: number; role?: UserEntity['role'] }): Promise<[UserEntity[], number]> {
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (params.role) qb.where('u.role = :role', { role: params.role });
    return qb
      .skip((params.page - 1) * params.limit)
      .take(params.limit)
      .getManyAndCount();
  }
}
