## Context

The current `users` table schema only stores an internal UUID, email, and credits info. To support modern authentication via Google OAuth, we need to extend the table with fields that store the unique identifier from Google (`google_id`), as well as basic profile information (`name` and `picture`).

## Goals / Non-Goals

**Goals:**

- Update `schema/schema.sql` to reflect the new `users` table structure.
- Add `google_id`, `name`, and `picture` fields to the `users` table.

**Non-Goals:**

- Implementing the OAuth flow in the backend API or frontend client (this change is strictly for the schema update).
- Implementing authentication tokens (JWTs or session management).

## Decisions

- **Table Structure**: We will drop and recreate the `users` table in `schema/schema.sql` with the new columns. This is a breaking change, but acceptable at this early stage of development.
- **Constraints**: `google_id` will be `UNIQUE NOT NULL` since it's the primary identifier from Google. `email` remains `UNIQUE NOT NULL`. `name` and `picture` will be simple `TEXT` fields (nullable, in case Google doesn't provide them or the user removes them).

## Risks / Trade-offs

- **Risk**: Dropping the `users` table will delete existing user data in the development database.
  - **Mitigation**: Acceptable in development. If there's production data, a migration script would be needed instead of `DROP TABLE`. But per current practice, we'll update the base schema file.
