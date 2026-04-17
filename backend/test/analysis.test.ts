import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb, TEST_SECRET } = vi.hoisted(() => {
  return {
    mockDb: {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      get: vi.fn().mockResolvedValue(null),
      insert: vi.fn().mockReturnThis(),
      values: vi.fn().mockReturnThis(),
      execute: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockReturnThis(),
      set: vi.fn().mockReturnThis(),
      batch: vi.fn().mockResolvedValue([{ success: true, meta: { changes: 1 } }]), // Mock successful batch execution
    },
    TEST_SECRET: 'test_jwt_secret_must_be_at_least_32_characters_long_for_hs256',
  }
});

vi.mock('drizzle-orm/d1', () => ({
  drizzle: () => mockDb,
  eq: vi.fn(),
  sql: vi.fn(),
  desc: vi.fn(),
  count: vi.fn()
}));

vi.mock('cloudflare:workers', () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    DB: {}
  }
}));

import { mainApp } from '../src/main';
import { jwtEncrypt } from '../src/lib/crypto/jwt';

describe('Analysis Endpoints', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const getValidToken = async () => {
    const { data: token } = await jwtEncrypt({
      payload: { id: 'test_user_id' },
      secretKey: TEST_SECRET,
    });
    return token;
  };

  it('POST /api/analysis/run should return 402 if insufficient credits', async () => {
    const token = await getValidToken();

    // Mock user with 0 credits
    mockDb.get.mockResolvedValueOnce({ credits: 0 });

    const request = new Request('http://localhost/api/analysis/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        albumin: 3.62,
        creatinine: 0.9,
        glucose: 92,
        crp: 2.5,
        lymphocyte_percent: 28,
        mcv: 97.4,
        rdw: 12.4,
        alkaline_phosphatase: 118,
        wbc: 4.996,
        age: 73.92
      })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(402);
  });

  it('POST /api/analysis/run should return phenoage result and deduct credit if sufficient credits', async () => {
    const token = await getValidToken();

    // Mock user with 10 credits
    mockDb.get.mockResolvedValueOnce({ credits: 10 });
    
    // Batch returns success for credit deduction
    mockDb.batch.mockResolvedValueOnce([{ success: true, meta: { changes: 1 } }]);

    const request = new Request('http://localhost/api/analysis/run', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        albumin: 3.62,
        creatinine: 0.9,
        glucose: 92,
        crp: 2.5,
        lymphocyte_percent: 28,
        mcv: 97.4,
        rdw: 12.4,
        alkaline_phosphatase: 118,
        wbc: 4.996,
        age: 73.92
      })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(200);
    const data = (await response.json()) as any;
    expect(data.phenotypicAge).toBeDefined();
    expect(mockDb.batch).toHaveBeenCalled();
  });

  it('POST /api/analysis/save should return 403 if storage limit reached', async () => {
    const token = await getValidToken();

    // Mock user max limit
    mockDb.get.mockResolvedValueOnce({ maxSavedAnalyses: 3 });
    // Mock current count
    mockDb.get.mockResolvedValueOnce({ count: 3 });

    const request = new Request('http://localhost/api/analysis/save', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ analysis_data: '{"some":"data"}' })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(403);
  });

  it('POST /api/analysis/save should save analysis if under limit', async () => {
    const token = await getValidToken();

    // Mock user max limit
    mockDb.get.mockResolvedValueOnce({ maxSavedAnalyses: 3 });
    // Mock current count
    mockDb.get.mockResolvedValueOnce({ count: 2 });

    const request = new Request('http://localhost/api/analysis/save', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ analysis_data: '{"some":"data"}' })
    });

    const response = await mainApp.handle(request);
    
    expect(response.status).toBe(201);
    expect(mockDb.insert).toHaveBeenCalled();
  });
});
