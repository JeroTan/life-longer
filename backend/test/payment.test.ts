import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, TEST_SECRET, WEBHOOK_SECRET } = vi.hoisted(() => {
  return {
    mockDb: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(null),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      batch: vi.fn().mockResolvedValue(undefined),
    },
    TEST_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long_for_hs256',
    WEBHOOK_SECRET: 'test_lemon_squeezy_webhook_secret_32_chars'
  }
});

vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
  eq: vi.fn(),
  sql: vi.fn()
}));

vi.mock('cloudflare:workers', () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    LEMON_SQUEEZY_API_KEY: 'test_api_key',
    LEMON_SQUEEZY_WEBHOOK_SECRET: WEBHOOK_SECRET,
    LEMON_SQUEEZY_STORE_ID: 'test_store_id',
    DB: {}
  }
}));

// Mock fetch globally
global.fetch = vi.fn();

import { mainApp } from '../src/main';
import { jwtEncrypt } from '../src/lib/crypto/jwt';

describe('Payment Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('POST /api/checkout should return checkout url', async () => {
    // Generate valid JWT
    const { data: token } = await jwtEncrypt({
      payload: { id: 'test_user_id' },
      secretKey: TEST_SECRET,
    });

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ data: { attributes: { url: 'https://test.lemonsqueezy.com/checkout' } } })
    });

    const request = new Request('http://localhost/api/checkout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ variant_id: 'test_variant' })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.url).toBe('https://test.lemonsqueezy.com/checkout');
  });

  it('POST /api/webhooks/lemonsqueezy should return 401 if invalid signature', async () => {
    const request = new Request('http://localhost/api/webhooks/lemonsqueezy', {
      method: 'POST',
      headers: {
        'X-Signature': 'invalid_signature',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ meta: { event_name: 'order_created' } })
    });

    const response = await mainApp.handle(request);
    if (response.status === 500) console.error(await response.text());
    expect(response.status).toBe(401);
  });

  it('POST /api/webhooks/lemonsqueezy should process valid signature', async () => {
    const payload = JSON.stringify({
      meta: {
        webhook_id: 'test_webhook_id',
        event_name: 'order_created',
        custom_data: { user_id: 'test_user_id' }
      },
      data: {
        attributes: {
          first_order_item: { variant_id: '50_CREDITS_VARIANT_ID' }
        }
      }
    });

    // Generate valid signature using crypto.subtle
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(WEBHOOK_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
    const signatureHex = Array.from(new Uint8Array(signatureBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');

    mockDb.get.mockResolvedValueOnce(null); // Idempotency check returns null (not processed)

    const request = new Request('http://localhost/api/webhooks/lemonsqueezy', {
      method: 'POST',
      headers: {
        'X-Signature': signatureHex,
        'Content-Type': 'application/json'
      },
      body: payload
    });

    const response = await mainApp.handle(request);
    expect(response.status).toBe(200);
    expect(mockDb.batch).toHaveBeenCalled();
  });
});
