import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  get: vi.fn().mockResolvedValue(null),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  execute: vi.fn().mockResolvedValue(undefined),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
};

vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
  eq: vi.fn()
}));

// Mock fetch globally
global.fetch = vi.fn();

// Mock cloudflare:workers before importing mainApp
vi.mock('cloudflare:workers', () => ({
  env: {
    GOOGLE_CLIENT_ID: 'test_client_id',
    GOOGLE_CLIENT_SECRET: 'test_client_secret',
    JWT_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long_for_hs256',
    HOST: 'localhost',
    DB: {}
  }
}));

import { mainApp } from '../src/main';

describe('Auth Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /auth/google should redirect to Google OAuth', async () => {
    const request = new Request('http://localhost/auth/google');
    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('https://accounts.google.com/o/oauth2/v2/auth');
    expect(response.headers.get('location')).toContain('client_id=test_client_id');
  });

  it('GET /auth/callback/google should handle callback and redirect with token', async () => {
    // Mock the tokens endpoint
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'mock_access_token' })
    });
    // Mock the user info endpoint
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: 'mock_google_id', email: 'test@example.com', name: 'Test', picture: 'test.jpg' })
    });

    const request = new Request('http://localhost/auth/callback/google?code=mock_auth_code');
    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(302);
    const location = response.headers.get('location');
    expect(location).toContain('lifelonger://login?token=');
  });

  it('POST /auth/register should create a user and return a token', async () => {
    mockDb.get.mockResolvedValueOnce(null); // email not in use

    const request = new Request('http://localhost/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@example.com', password: 'password123' })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(201);
    const data = (await response.json()) as any;
    expect(data.token).toBeDefined();
  });

  it('POST /auth/login should return a token for valid credentials', async () => {
    // Generate valid hash using subtle crypto natively available
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode('password123');
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");

    mockDb.get.mockResolvedValueOnce({
      id: 'test_user_id',
      password: hashHex
    });

    const request = new Request('http://localhost/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test2@example.com', password: 'password123' })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.token).toBeDefined();
  });
});
