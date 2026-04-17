## 1. Setup and Infrastructure

- [x] 1.1 Extract PhenoAge Gompertz parameters and mathematical weights from `.raw-data/phenoage calculator spreadshet.xlsx` (or its CSV counterpart) into a new math utility.
- [x] 1.2 Implement the JWT authentication middleware using `jose` and `env.JWT_SECRET` that injects `user_id` into the Elysia context.

## 2. Global Elysia App

- [x] 2.1 Refactor the main entry point to instantiate Elysia with CORS and a global `.onError` handler that returns cleanly formatted JSON error messages with proper HTTP status codes.

## 3. Auth & User Endpoints

- [x] 3.1 Implement `GET /auth/google` to construct and redirect to the Google OAuth2 authorization URL.
- [x] 3.2 Implement `GET /auth/callback/google` to exchange the code, fetch the user profile, ensure a D1 user record exists, generate a JWT, and redirect to the mobile app deep link.
- [x] 3.3 Implement `GET /api/user/me` (protected) to query and return the user's name, email, credits balance, and max_saved_analyses limit.

## 4. Lemon Squeezy Integration

- [x] 4.1 Implement `POST /api/checkout` (protected) using `env.LEMON_SQUEEZY_API_KEY` to generate a checkout URL, injecting the `user_id`.
- [x] 4.2 Implement `POST /api/webhooks/lemonsqueezy` with HMAC SHA-256 validation (`crypto.subtle`), idempotency checks in `processed_webhooks`, and atomic updates using `env.DB.batch()`.

## 5. PhenoAge Analysis Endpoints

- [x] 5.1 Implement `POST /api/analysis/run` (protected) with strict TypeBox validation for 9 biomarkers. Deduct credits atomically and return the computed Phenotypic Age.
- [x] 5.2 Implement `POST /api/analysis/save` (protected) to save the analysis, verifying against `max_saved_analyses`.
- [x] 5.3 Implement `GET /api/analysis/history` (protected) to return all saved analyses for the authenticated user.
