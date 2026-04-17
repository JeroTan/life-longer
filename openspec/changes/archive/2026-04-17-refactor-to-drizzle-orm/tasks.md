## 1. Setup Drizzle ORM Schema

- [x] 1.1 Create `backend/src/db/schema.ts`.
- [x] 1.2 Define Drizzle schema for `users`, `biomarkers`, `interventions`, and `biomarker_interventions` tables.
- [x] 1.3 Define Drizzle schema for `user_biomarker_logs`, `saved_analyses`, `processed_webhooks`, and `credit_ledger` tables.

## 2. Refactor Auth Flow

- [x] 2.1 Refactor `AuthService` to use Drizzle for querying and inserting users.
- [x] 2.2 Refactor `AuthController` to handle HTTP response composition and status codes for auth routes.

## 3. Refactor User Flow

- [x] 3.1 Refactor `UserService` to use Drizzle for querying the user by ID.
- [x] 3.2 Refactor `UserController` to return the user response appropriately, handling any "User not found" errors.

## 4. Refactor Payment Flow

- [x] 4.1 Refactor `PaymentService` to use Drizzle, particularly using `db.batch()` for the atomic webhook operations (`users`, `processed_webhooks`, `credit_ledger`).
- [x] 4.2 Refactor `PaymentController` to map `PaymentService` exceptions (e.g., "Invalid signature") to the correct HTTP status codes (e.g., 401).

## 5. Refactor Analysis Flow

- [x] 5.1 Refactor `AnalysisService` to use Drizzle for fetching credits, deducting credits atomically, checking storage limits, and saving analyses.
- [x] 5.2 Refactor `AnalysisController` to map `AnalysisService` exceptions (e.g., "Payment Required", "Storage limit reached") to the appropriate HTTP status codes (e.g., 402, 403).
