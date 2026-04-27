import { inject, injectable } from 'tsyringe';
import { UserRepository } from './user.repository';
import { EventBus } from '@core/events/event-bus';
import { DomainEvents } from '@core/events/domain-events';
import { NotFoundException } from '@shared/exceptions/http.exception';
import { Tokens } from '@core/di/tokens';
import {
  toUserPublicDto,
  type UpdateUserDto,
  type ListUsersCursorQuery,
  type UserPublicDto,
} from './dto/user.dto';

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

  async list(query: ListUsersCursorQuery): Promise<{
    items: UserPublicDto[];
    nextCursor: string | null;
  }> {
    const page = await this.users.list(query);
    return {
      items: page.items.map(toUserPublicDto),
      nextCursor: page.nextCursor,
    };
  }

  async delete(id: string): Promise<void> {
    const user = await this.users.findById(id);
    if (!user) throw new NotFoundException('User');
    await this.users.softDelete(id);
    this.events.publish(DomainEvents.User.Deleted, { userId: id });
  }
}
