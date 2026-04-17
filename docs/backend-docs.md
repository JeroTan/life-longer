# LifeLonger Backend Documentation

This document serves as a summary of the backend architecture, the features implemented, technical highlights, and future recommendations for the **LifeLonger** backend.

## 🧠 Knowledge Learned & Architecture Overview

The backend is engineered for a React Native (Expo) mobile application, focusing on performance, edge-compatibility, and type safety.

- **Infrastructure:** Deployed entirely on **Cloudflare Workers**. This ensures low latency globally and seamless integration with Cloudflare's ecosystem.
- **Framework:** **ElysiaJS** is used as the core web framework. It provides excellent TypeScript support, native Cloudflare Worker adapters, and built-in TypeBox validation.
- **Database:** **Cloudflare D1** (Serverless SQLite) is the primary data store.
- **ORM:** **Drizzle ORM** is used to interact with D1, providing strict end-to-end type safety from the database schema to the API responses.
- **Authentication:** Stateless JWT authentication is used. Since Node's built-in `crypto` is not available on the Edge, we use the `jose` library for signing and verifying JWTs, and Web Crypto API (`crypto.subtle`) for hashing.
- **Dependency Injection:** The project strictly follows a Controller-Service pattern, manually wired together in `src/container.ts` to separate transport logic (HTTP status codes, route definitions) from pure business logic.

## 🚀 Features Implemented

Over the course of development, the following core features were successfully implemented:

1. **Database Schema & Drizzle Integration:**
   - Defined the complete D1 schema using Drizzle ORM, covering 8 core tables: `users`, `biomarkers`, `interventions`, `biomarker_interventions`, `user_biomarker_logs`, `saved_analyses`, `processed_webhooks`, and `credit_ledger`.
2. **Google OAuth Authentication:**
   - Implemented `/auth/google` and `/auth/callback/google`.
   - Handled the OAuth flow, exchanging codes for access tokens, fetching user profiles, and provisioning D1 user records.
   - Generates and returns a secure JWT payload.
3. **User Management:**
   - Implemented a protected `/api/user/me` endpoint to fetch user profiles, credit balances, and storage limits.
4. **Lemon Squeezy Payments & Webhooks:**
   - Built `/api/checkout` to generate payment links.
   - Built a secure `/api/webhooks/lemonsqueezy` endpoint that reads the raw request body to verify the `X-Signature` using `crypto.subtle` HMAC SHA-256.
   - Implemented idempotency using the `processed_webhooks` table.
   - Used D1/Drizzle atomic `.batch()` transactions to securely credit users and update the ledger.
5. **Phenotypic Age Analysis:**
   - Translated the complex Gompertz parameters and mathematical weights from the John G. Cramer spreadsheet into a robust `phenoage.ts` utility.
   - Implemented `/api/analysis/run` with strict TypeBox validation to calculate biological age, atomically deducting user credits.
   - Implemented `/api/analysis/save` and `/api/analysis/history` to manage freemium storage limits.
6. **OpenAPI Documentation:**
   - Integrated `@elysiajs/openapi` and enriched all routes with `detail` blocks (tags, summaries, descriptions, security schemes) to auto-generate a beautiful Swagger UI.
7. **Automated Testing:**
   - Setup a `vitest` testing environment tailored for mocking Cloudflare `env` variables and the Drizzle ORM database.
   - Wrote comprehensive unit/integration tests for Auth, User, Payment, and Analysis endpoints to guarantee reliability.

## ✨ Technical Highlights

- **Edge-Native:** Zero reliance on Node.js built-ins. Everything from JWTs to Webhooks runs flawlessly on Cloudflare's V8 isolates.
- **Type Safety:** From Elysia's route definitions to Drizzle's database queries, the entire pipeline is fully typed.
- **Webhook Raw Body Parsing:** Overcame Elysia's default JSON parsing behavior by using `parse: "text"` on the Lemon Squeezy webhook route. This allowed us to preserve the exact payload string required for accurate HMAC signature verification while keeping TypeScript happy.
- **Atomic Transactions:** Critical financial operations (like adding credits upon a successful purchase or deducting them upon running an analysis) are bundled into `db.batch()` queries, ensuring the `users` table and `credit_ledger` always stay in perfect sync.

## 🔮 Things to Add in the Future

While the core backend is solid, here are recommendations for future iterations:

1. **End-to-End (E2E) Testing:** 
   - Integrate the backend with the React Native frontend to run complete E2E user flows (e.g., using Detox or Appium).
2. **Error Tracking & Logging:**
   - Implement an edge-compatible logging service (like Sentry or Datadog) inside the global `.onError` handler to monitor production worker crashes or failed webhooks.
3. **Database Migrations Workflow:**
   - Set up `drizzle-kit` migration scripts so that as the schema evolves, we can automatically generate and apply SQL migrations to both local and production D1 databases rather than using `DROP TABLE` approaches.
4. **Rate Limiting:**
   - Add a rate-limiting middleware (using Cloudflare KV or Durable Objects) to prevent abuse on public endpoints like `/auth/google` and `/api/webhooks`.
5. **Durable Objects Real-Time Features:**
   - The architecture is primed for WebSockets via Durable Objects (as noted in the guidelines). Future features like live collaborative analysis or real-time progress indicators could heavily utilize this.