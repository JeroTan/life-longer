## Context

The backend serves a React Native (Expo) mobile application. It is deployed to Cloudflare Workers and utilizes Cloudflare D1 for SQLite database storage. The application relies on Elysia.js for routing and validation.

## Goals / Non-Goals

**Goals:**

- Implement a robust Elysia app structure with CORS and a global `.onError` handler.
- Provide secure, stateless JWT authentication via a custom `jose`-based middleware.
- Integrate Google OAuth2 for user authentication.
- Integrate Lemon Squeezy webhooks for processing payments securely with idempotency checks.
- Process biological data to calculate Phenotypic Age using established formulas (Gompertz parameters, weights, etc.) extracted from a provided spreadsheet.

**Non-Goals:**

- Implementing a frontend UI or handling client-side session management beyond providing the deep link with the token.
- Node.js dependencies: We must strictly avoid built-in Node.js modules like `crypto` or `fs` in favor of Web APIs.

## Decisions

- **Framework**: ElysiaJS. Chosen for its native Cloudflare Worker support, excellent performance, and TypeBox integration for strict runtime validation and OpenAPI generation.
- **Auth Middleware**: A custom macro/middleware using the edge-compatible `jose` library. It will verify the `Authorization: Bearer <token>` header against the `JWT_SECRET` environment variable and inject the `user_id` into the context.
- **Webhooks**: Lemon Squeezy webhooks will be verified using `crypto.subtle` (HMAC SHA-256) to ensure the request is legitimate.
- **Database Transactions**: We will use `env.DB.batch()` to ensure atomicity when updating the `users`, `processed_webhooks`, and `credit_ledger` tables during webhook processing or credit deduction.

## Risks / Trade-offs

- **Risk**: Edge compatibility issues with cryptography.
  - **Mitigation**: Strictly use `crypto.subtle` for HMAC and `jose` for JWTs instead of Node's `crypto` module.
- **Risk**: Webhook replays or duplicate credit issuance.
  - **Mitigation**: Implement idempotency by tracking processed webhook IDs in the `processed_webhooks` table.
