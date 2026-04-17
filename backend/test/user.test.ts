import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, TEST_SECRET } = vi.hoisted(() => {
  return {
    mockDb: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(null),
    },
    TEST_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long_for_hs256'
  }
});

vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
  eq: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    DB: {}
  }
}));

import { mainApp } from '../src/main';
import { jwtEncrypt } from '../src/lib/crypto/jwt';

describe('User Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /api/user/me should return 401 if unauthorized', async () => {
    const request = new Request('http://localhost/api/user/me');
    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(401);
  });

  it('GET /api/user/me should return user data if authorized', async () => {
    // Generate valid JWT
    const { data: token } = await jwtEncrypt({
      payload: { id: 'test_user_id' },
      secretKey: TEST_SECRET,
    });

    mockDb.get.mockResolvedValueOnce({
      name: 'Test User',
      email: 'test@example.com',
      credits: 10,
      maxSavedAnalyses: 3
    });

    const request = new Request('http://localhost/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(200);
    
    const data = (await response.json()) as any;
    expect(data.name).toBe('Test User');
    expect(data.email).toBe('test@example.com');
  });

  it('GET /api/user/me should return 404 if user not found in DB', async () => {
    // Generate valid JWT
    const { data: token } = await jwtEncrypt({
      payload: { id: 'nonexistent_user' },
      secretKey: TEST_SECRET,
    });

    mockDb.get.mockResolvedValueOnce(null);

    const request = new Request('http://localhost/api/user/me', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(404);
  });
});
