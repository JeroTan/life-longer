import { describe, it, expect, vi, beforeEach } from "vitest";

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
    },
    TEST_SECRET: "test_jwt_secret_must_be_at_least_32_characters_long_for_hs256",
  };
});

vi.mock("drizzle-orm/d1", () => ({
  drizzle: () => mockDb,
  eq: vi.fn(),
}));

vi.mock("cloudflare:workers", () => ({
  env: {
    JWT_SECRET: TEST_SECRET,
    DB: {},
  },
}));

import { mainApp } from "../src/main";

describe("Auth -> User Integration Flow", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should register a user (or login if already exists) and then access /me with the returned token", async () => {
    const email = "integration@test.com";
    const password = "password123";
    let token: string;

    // 1. Attempt Registration
    mockDb.get.mockResolvedValueOnce(null); // Mock "not found" for first check

    const registerRequest = new Request("http://localhost/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let response = await mainApp.handle(registerRequest);

    // If registration fails because user exists, fallback to login
    if (response.status === 400) {
      const errorData = (await response.json()) as any;
      if (errorData.error === "Email already in use") {
        const loginRequest = new Request("http://localhost/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });
        response = await mainApp.handle(loginRequest);
      }
    }

    expect(response.status === 200 || response.status === 201).toBe(true);
    const authData = (await response.json()) as any;
    token = authData.token;
    expect(token).toBeDefined();

    // 2. Use token to call /api/user/me
    mockDb.get.mockResolvedValueOnce({
      name: "Integration User",
      email: email,
      credits: 3,
      maxSavedAnalyses: 3,
    });

    const meRequest = new Request("http://localhost/api/user/me", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const meResponse = await mainApp.handle(meRequest);
    expect(meResponse.status).toBe(200);

    const userData = (await meResponse.json()) as any;
    expect(userData.email).toBe(email);
    expect(userData.credits).toBe(3);
  });
});
