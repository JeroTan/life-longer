## 1. Database Schema Updates

- [x] 1.1 Update `schema/schema.sql` to make the `google_id` column nullable (remove `NOT NULL`) and add a `password TEXT` column.
- [x] 1.2 Update `backend/src/db/schema.ts` to match the new `users` schema (remove `.notNull()` from `googleId` and add `password` column).

## 2. Service Implementation

- [x] 2.1 Implement `registerUser` method in `AuthService` that accepts an email and password, hashes the password using `src/lib/crypto/hash.ts`, inserts the user, and returns a JWT.
- [x] 2.2 Implement `loginUser` method in `AuthService` that verifies the email and password, and returns a JWT.
- [x] 2.3 Implement `forgotPassword` method in `AuthService` that accepts an email and logs the password reset intent.

## 3. Controller & Route Implementation

- [x] 3.1 Implement `register`, `login`, and `forgotPassword` methods in `AuthController` that map to the service methods.
- [x] 3.2 Add `POST /auth/register`, `POST /auth/login`, and `POST /auth/forgot-password` routes to `AuthRoutes` in `backend/src/routes/auth.routes.ts` with proper TypeBox input validation and OpenAPI documentation.

## 4. Testing

- [x] 4.1 Update `backend/test/auth.test.ts` to include tests for the new `POST /auth/register` and `POST /auth/login` endpoints.