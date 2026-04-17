## Why

Currently, the application only supports Google OAuth for user authentication. To provide more flexibility and accommodate users who prefer not to use third-party providers, we need to introduce a native email and password authentication system. This will include registration, login, and forgot password functionalities.

## What Changes

- **BREAKING**: Modify the `users` table schema to include an optional `password` column for storing hashed passwords.
- **BREAKING**: Modify the `google_id` column in the `users` table to be nullable, as users registering via email/password will not have a Google ID.
- Implement `/auth/register` to allow new users to create accounts with an email and password.
- Implement `/auth/login` to authenticate users and return a JWT.
- Implement `/auth/forgot-password` to handle password reset requests (e.g., generating a reset token or logging the request, pending email service integration).

## Capabilities

### New Capabilities
- `password-auth`: The capability for users to register, log in, and recover their passwords using an email and password, independent of Google OAuth.

### Modified Capabilities

## Impact

- **Database**: The `schema/schema.sql` and Drizzle ORM schema (`backend/src/db/schema.ts`) will be updated to modify `google_id` (make it nullable) and add `password`. Existing databases must be migrated or recreated.
- **Backend API**: New routes, controllers, and services will be added to the Elysia app to handle password hashing (`crypto.subtle`), validation, and JWT issuance for native auth.
