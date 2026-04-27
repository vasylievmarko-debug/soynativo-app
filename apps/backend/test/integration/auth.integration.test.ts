import request from 'supertest';
import * as bcrypt from 'bcryptjs';
import { createApp } from '@/app';
import { registerCoreServices } from '@core/di/container';
import { AppDataSource } from '@core/database/data-source';
import { UserEntity } from '@modules/users/user.entity';
import { env } from '@config/env';

describe('POST /api/v1/auth (integration)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(async () => {
    registerCoreServices();
    if (!AppDataSource.isInitialized) await AppDataSource.initialize();
    app = createApp();

    // Seed a user directly (no register endpoint exists in v1.0).
    const userRepo = AppDataSource.getRepository(UserEntity);
    await userRepo.delete({ email: 'roundtrip@test.local' });
    const passwordHash = await bcrypt.hash('Sup3rSecret!', env.BCRYPT_ROUNDS);
    await userRepo.save(
      userRepo.create({
        email: 'roundtrip@test.local',
        passwordHash,
        firstName: 'Round',
        lastName: 'Trip',
        role: 'student',
      })
    );
  });

  afterAll(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.getRepository(UserEntity).delete({ email: 'roundtrip@test.local' });
      await AppDataSource.destroy();
    }
  });

  it('login → /users/me round-trip', async () => {
    const login = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'roundtrip@test.local', password: 'Sup3rSecret!' });
    expect(login.status).toBe(200);
    const accessToken = login.body.tokens.accessToken;

    const me = await request(app).get('/api/v1/users/me').set('Authorization', `Bearer ${accessToken}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe('roundtrip@test.local');
  });

  it('returns 401 without bearer token', async () => {
    const res = await request(app).get('/api/v1/users/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('returns 401 on wrong credentials', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'roundtrip@test.local', password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('returns 422 with field errors on invalid login payload', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'not-an-email', password: '' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});
