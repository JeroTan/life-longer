## Context

The backend currently supports only Google OAuth for authentication, relying on the `google_id` column which is marked as `UNIQUE NOT NULL`. To support users who wish to register and log in using an email and password, we must alter the database schema to store hashed passwords and make the Google ID optional. Furthermore, we need new endpoints for `/auth/register`, `/auth/login`, and `/auth/forgot-password`.

## Goals / Non-Goals

**Goals:**
- Update `users` table schema in both `schema/schema.sql` and `src/db/schema.ts` to make `google_id` nullable.
- Add an optional `password` column to the `users` table to store securely hashed passwords.
- Implement `/auth/register` to create a new user with an email and hashed password.
- Implement `/auth/login` to authenticate an email and password, returning a JWT.
- Implement `/auth/forgot-password` as a placeholder endpoint that logs the reset request (actual email integration deferred).
- Ensure existing utility functions in `src/lib/crypto/hash.ts` are used for password hashing and verification.

**Non-Goals:**
- Implementing an actual email sending service for password resets.
- Modifying the mobile app UI.

## Decisions

- **Database Schema Changes**: The `google_id` column will be changed to `TEXT UNIQUE` (dropping `NOT NULL`). A new column `password` will be added as `TEXT`. Since SQLite does not natively support altering a column to drop `NOT NULL` without recreating the table, we will recreate the table in our schema definition.
- **Hashing Algorithm**: We will utilize the existing `hash` and `verifyHash` functions in `src/lib/crypto/hash.ts` which rely on `crypto.subtle` to generate salted SHA-256 hashes, ensuring compatibility with Cloudflare Workers.
- **Endpoint Structure**: The new endpoints will be exposed under the existing `/auth` route group.
  - `POST /auth/register`: Requires `email` and `password`. Returns a JWT.
  - `POST /auth/login`: Requires `email` and `password`. Returns a JWT or 401.
  - `POST /auth/forgot-password`: Requires `email`. Returns 200 (logs the intent).

## Risks / Trade-offs

- **Risk**: Modifying the `users` table is a breaking change.
  - **Mitigation**: In a development environment, dropping and recreating the database is acceptable. In production, a proper migration script would be required to copy existing data. We will update the schema definitions, and developers will need to reset their local DBs.
