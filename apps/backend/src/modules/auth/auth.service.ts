import bcrypt from 'bcryptjs';
import { inject, injectable } from 'tsyringe';
import { UserRepository } from '@modules/users/user.repository';
import { UnauthorizedException, NotFoundException } from '@shared/exceptions/http.exception';
import { EventBus } from '@core/events/event-bus';
import { Tokens } from '@core/di/tokens';
import { TokenService } from './token.service';
import type { LoginDto, TokenPair } from './dto/auth.dto';
import { toUserPublicDto, type UserPublicDto } from '@modules/users/dto/user.dto';

@injectable()
export class AuthService {
  constructor(
    private readonly users: UserRepository,
    private readonly tokens: TokenService,
    @inject(Tokens.EventBus) private readonly events: EventBus
  ) {}

  async login(dto: LoginDto): Promise<{ user: UserPublicDto; tokens: TokenPair }> {
    const user = await this.users.findByEmail(dto.email, true);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    await this.users.update(user.id, { lastLoginAt: new Date() });

    const tokens = this.tokens.issuePair({ sub: user.id, email: user.email, role: user.role });
    return { user: toUserPublicDto(user), tokens };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    const { sub } = this.tokens.verifyRefresh(refreshToken);
    const user = await this.users.findById(sub);
    if (!user) throw new NotFoundException('User');
    return this.tokens.issuePair({ sub: user.id, email: user.email, role: user.role });
  }
}
