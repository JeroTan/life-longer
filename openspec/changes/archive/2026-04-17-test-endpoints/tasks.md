## 1. Setup Testing Infrastructure

- [x] 1.1 Install a testing framework like `vitest` or `bun test` in the `backend` directory.
- [x] 1.2 Create a `vitest.config.ts` (or equivalent) and configure it for testing the ElysiaJS app.
- [x] 1.3 Add a `test` script to `package.json`.

## 2. Implement Tests

- [x] 2.1 Create tests for `GET /auth/google` and `GET /auth/callback/google` to verify redirects and JWT generation.
- [x] 2.2 Create tests for `GET /api/user/me` testing both authorized (with JWT) and unauthorized requests.
- [x] 2.3 Create tests for `POST /api/checkout` and `POST /api/webhooks/lemonsqueezy` testing signature validation and idempotency.
- [x] 2.4 Create tests for `/api/analysis/run` and `/api/analysis/save` testing valid input and credit deduction.
