## Why

The initial implementation of the Elysia backend utilized raw SQL queries directly against Cloudflare D1. While functional, this lacks type safety and maintainability. Furthermore, the separation of concerns between Controllers and Services needs improvement: Controllers should be responsible for composing HTTP responses and status codes, while Services should focus purely on business logic and returning raw data. Refactoring to use Drizzle ORM addresses both issues and aligns with the `backend-general-guidlines.md`.

## What Changes

- **Refactor**: Replace all raw `db.prepare(...).run()` and `db.batch(...)` calls in `AuthService`, `UserService`, `PaymentService`, and `AnalysisService` with Drizzle ORM queries.
- **Refactor**: Create a Drizzle schema (`schema.ts`) that accurately mirrors the 8 tables defined in `docs/database-schema.md` (users, biomarkers, interventions, biomarker_interventions, user_biomarker_logs, saved_analyses, processed_webhooks, credit_ledger).
- **Refactor**: Update Controllers to handle HTTP status codes and response formatting based on the raw data or errors returned by the Services.
- **Refactor**: Remove HTTP-specific logic from Services. Services should only return raw data objects or throw standard/semantic errors.

## Capabilities

### New Capabilities
- `drizzle-integration`: The capability to interact with the Cloudflare D1 database using type-safe Drizzle ORM queries.

### Modified Capabilities

## Impact

- **Backend Architecture**: Improves code maintainability, type safety, and strict separation of concerns between the transport layer (Controllers) and business layer (Services).
- **Database**: Interactions with Cloudflare D1 will exclusively go through Drizzle ORM.
