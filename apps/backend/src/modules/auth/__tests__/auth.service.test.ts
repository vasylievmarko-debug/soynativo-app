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

  describe('register', () => {
    it('issues tokens and persists the user when email is new', async () => {
      const result = await auth.register({
        email: 'new@test.local',
        password: 'Sup3rSecret!',
        firstName: 'Ada',
        lastName: 'Lovelace',
        role: 'student',
      });

      expect(result.user.email).toBe('new@test.local');
      expect(result.tokens.accessToken).toBeTruthy();
      expect(result.tokens.refreshToken).toBeTruthy();
      expect(await users.findByEmail('new@test.local')).not.toBeNull();
    });

    it('rejects duplicate emails with ConflictException', async () => {
      await auth.register({
        email: 'dup@test.local',
        password: 'Sup3rSecret!',
        firstName: 'A',
        lastName: 'B',
        role: 'student',
      });

      await expect(
        auth.register({
          email: 'dup@test.local',
          password: 'Sup3rSecret!',
          firstName: 'A',
          lastName: 'B',
          role: 'student',
        })
      ).rejects.toMatchObject({ statusCode: 409 });
    });

    it('publishes user.registered domain event', async () => {
      const handler = jest.fn();
      events.subscribe('user.registered', handler);

      await auth.register({
        email: 'evt@test.local',
        password: 'Sup3rSecret!',
        firstName: 'A',
        lastName: 'B',
        role: 'student',
      });

      // Allow the EventEmitter microtask queue to flush
      await new Promise((r) => setImmediate(r));
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('login', () => {
    it('rejects unknown email with 401 (does not leak existence)', async () => {
      await expect(auth.login({ email: 'ghost@test.local', password: 'x' })).rejects.toMatchObject({
        statusCode: 401,
      });
    });
  });
});
