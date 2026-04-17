## Context

The backend codebase currently uses raw SQL strings executed via `env.DB.prepare(...).run()` to interact with the Cloudflare D1 SQLite database. In addition, the separation between Controllers and Services has blurred; Services currently handle HTTP status codes and responses directly. To align with `backend-general-guidlines.md` and improve maintainability, we need to introduce Drizzle ORM for type-safe database queries and move HTTP concern handling to the Controllers.

## Goals / Non-Goals

**Goals:**
- Define the database schema using Drizzle ORM in `backend/src/db/schema.ts`.
- Refactor `AuthService`, `UserService`, `PaymentService`, and `AnalysisService` to use Drizzle ORM instead of raw `D1Database` queries.
- Refactor the Services to return raw data or throw semantic/standard errors.
- Refactor `AuthController`, `UserController`, `PaymentController`, and `AnalysisController` to catch these errors and compose proper HTTP responses/codes, separating transport concerns from business logic.

**Non-Goals:**
- Changing any underlying table structures or adding new database tables.
- Modifying the mobile app or altering the API payload structures (the endpoints should behave identically from the client's perspective).

## Decisions

- **Drizzle ORM over Raw SQL**: Drizzle provides type-safety, which will significantly reduce runtime errors and make future schema modifications easier.
- **Controller vs Service Boundaries**: Controllers act as the transport layer, handling `Elysia`'s request/response cycle. Services handle business logic. If a service needs to indicate an error (e.g., User not found, Not enough credits), it will `throw new Error(...)`. The Controller (or the global `.onError` handler) will catch it and map it to `404`, `402`, etc.

## Risks / Trade-offs

- **Risk**: Migrating from raw SQL to Drizzle might introduce subtle query changes.
  - **Mitigation**: We will map the Drizzle schema directly one-to-one with the tables in `docs/database-schema.md` and test the queries carefully.
- **Risk**: Transactions / Batching with Drizzle.
  - **Mitigation**: Drizzle natively supports D1 batching via `db.batch([])`. We will use this to replace the raw `db.batch()` calls for atomic operations like the credit ledger and webhook processing.
