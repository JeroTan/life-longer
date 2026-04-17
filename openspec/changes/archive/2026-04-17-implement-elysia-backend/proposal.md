## Why

The backend needs a robust, complete API for the "LifeLonger" native React Native (Expo) mobile app. This API must handle user authentication via Google OAuth, integrations with Lemon Squeezy for payments and credits, and perform complex Phenotypic Age calculations while securely storing data in Cloudflare D1.

## What Changes

- Create a global Elysia.js app with CORS and custom error handling.
- Implement an authentication middleware using Edge-compatible `jose` for JWT validation.
- Add Google OAuth endpoints (`/auth/google`, `/auth/callback/google`).
- Add user endpoints (`/api/user/me`).
- Add Lemon Squeezy checkout and webhook endpoints (`/api/checkout`, `/api/webhooks/lemonsqueezy`).
- Add phenotypic analysis calculation and storage endpoints (`/api/analysis/run`, `/api/analysis/save`, `/api/analysis/history`).

## Capabilities

### New Capabilities

- `backend-core-api`: The core API capability that encompasses Google Auth, Lemon Squeezy billing webhooks, and the Phenotypic Age analysis calculation logic.

### Modified Capabilities

## Impact

- **Backend**: Overhauls the main entry point (and routing) of the Elysia.js application.
- **Database**: The endpoints will read from and write to the `users`, `processed_webhooks`, `credit_ledger`, and `saved_analyses` tables in the Cloudflare D1 database.
- **External Services**: Integrates with Google OAuth and the Lemon Squeezy API.
