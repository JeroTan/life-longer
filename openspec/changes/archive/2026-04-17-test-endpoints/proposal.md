## Why

We have implemented the core ElysiaJS backend API, including Google OAuth authentication, Lemon Squeezy webhooks, and the Phenotypic Age analysis calculation endpoints using Drizzle ORM. To ensure these endpoints function correctly and handle edge cases, we need to create an automated testing suite. This will catch regressions early and verify that the API meets its specifications.

## What Changes

- Setup an automated testing framework (e.g., using Elysia's Eden Treaty or a testing library like `bun test` or `vitest` suitable for Cloudflare Workers/Elysia).
- Write tests for the `/auth/google` and `/auth/callback/google` endpoints to ensure redirection and token generation logic works.
- Write tests for the protected `/api/user/me` endpoint.
- Write tests for the Phenotypic Age analysis endpoints (`/api/analysis/run`, `/api/analysis/save`, `/api/analysis/history`), including testing credit deduction and storage limits.
- Write tests for the Lemon Squeezy webhook endpoint (`/api/webhooks/lemonsqueezy`) ensuring signature validation and idempotency work.

## Capabilities

### New Capabilities
- `api-testing`: A comprehensive testing suite to validate the behavior, authentication, and error handling of the backend API endpoints.

### Modified Capabilities

## Impact

- **Backend**: Adds testing infrastructure and test files to the codebase. No production behavior or runtime logic is changed.
- **Development**: Improves developer confidence and catches bugs during the development cycle.
