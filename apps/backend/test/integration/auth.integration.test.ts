import request from 'supertest';
import { createApp } from '@/app';
import { registerCoreServices } from '@core/di/container';

describe('POST /api/v1/auth (integration)', () => {
  let app: ReturnType<typeof createApp>;

  beforeAll(() => {
    registerCoreServices();
    app = createApp();
  });

  it('register → login → /users/me round-trip', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'roundtrip@test.local',
        password: 'Sup3rSecret!',
        firstName: 'Round',
        lastName: 'Trip',
        role: 'student',
      });
    expect(reg.status).toBe(201);

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

  it('returns 422 with field errors on invalid registration', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' });
    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toHaveProperty('email');
    expect(res.body.error.details).toHaveProperty('password');
  });
});
