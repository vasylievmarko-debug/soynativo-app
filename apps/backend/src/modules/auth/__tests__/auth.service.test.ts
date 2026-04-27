import * as bcrypt from 'bcryptjs';
import { AuthService } from '../auth.service';
import { TokenService } from '../token.service';
import { EventBus } from '@core/events/event-bus';
import { InMemoryUserRepository } from '../../../../test/doubles/in-memory-user.repository';
import type { UserRepository } from '@modules/users/user.repository';

describe('AuthService', () => {
  let users: InMemoryUserRepository;
  let auth: AuthService;
  let events: EventBus;

  beforeEach(() => {
    users = new InMemoryUserRepository();
    events = new EventBus();
    auth = new AuthService(users as unknown as UserRepository, new TokenService(), events);
  });

  describe('login', () => {
    it('rejects unknown email with 401 (does not leak existence)', async () => {
      await expect(auth.login({ email: 'ghost@test.local', password: 'x' })).rejects.toMatchObject({
        statusCode: 401,
      });
    });

    it('rejects wrong password with 401', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      await users.create({
        email: 'real@test.local',
        passwordHash,
        firstName: 'Real',
        lastName: 'User',
        role: 'student',
      });

      await expect(
        auth.login({ email: 'real@test.local', password: 'wrong-password' })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it('issues tokens on valid credentials', async () => {
      const passwordHash = await bcrypt.hash('correct-password', 10);
      await users.create({
        email: 'valid@test.local',
        passwordHash,
        firstName: 'Valid',
        lastName: 'User',
        role: 'student',
      });

      const result = await auth.login({ email: 'valid@test.local', password: 'correct-password' });

      expect(result.user.email).toBe('valid@test.local');
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
    });
  });

  describe('refresh', () => {
    it('rejects invalid refresh token', async () => {
      await expect(auth.refresh('invalid-token')).rejects.toMatchObject({ statusCode: 401 });
    });
  });
});
