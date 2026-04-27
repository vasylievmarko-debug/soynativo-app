import { inject, injectable } from 'tsyringe';
import { UserRepository } from './user.repository';
import { EventBus } from '@core/events/event-bus';
import { DomainEvents } from '@core/events/domain-events';
import { NotFoundException } from '@shared/exceptions/http.exception';
import { Tokens } from '@core/di/tokens';
import { toUserPublicDto, type UpdateUserDto, type ListUsersQuery, type UserPublicDto } from './dto/user.dto';

@injectable()
export class UserService {
  constructor(
    private readonly users: UserRepository,
    @inject(Tokens.EventBus) private readonly events: EventBus
  ) {}

  async getById(id: string): Promise<UserPublicDto> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User');
    return toUserPublicDto(user);
  }

  async update(id: string, patch: UpdateUserDto): Promise<UserPublicDto> {
    const updated = await this.users.update(id, patch);
    if (!updated) throw new NotFoundException('User');
    this.events.publish(DomainEvents.User.Updated, { userId: id, patch });
    return toUserPublicDto(updated);
  }

  async list(query: ListUsersQuery): Promise<{ data: UserPublicDto[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.users.list(query);
    return { data: items.map(toUserPublicDto), total, page: query.page, limit: query.limit };
  }

  async delete(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User');
    await this.users.softDelete(id);
    this.events.publish(DomainEvents.User.Deleted, { userId: id });
  }
}
