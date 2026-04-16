## Why

We need to update the `users` table schema to support Google OAuth authentication. This will allow users to seamlessly sign in using their Google accounts, and will enable the application to store their Google profile information (`google_id`, `name`, and `picture`).

## What Changes

- **BREAKING**: Modify the `users` table schema in the database.
- Add `google_id` (TEXT, UNIQUE, NOT NULL) to the `users` table to track the unique Google account identifier.
- Add `name` (TEXT) to the `users` table to store the user's name from their Google profile.
- Add `picture` (TEXT) to the `users` table to store the user's profile picture URL from Google.

## Capabilities

### New Capabilities
- `user-google-auth`: The capability for users to authenticate via Google OAuth and have their profile data stored.

### Modified Capabilities

## Impact

- **Database**: The `schema/schema.sql` file needs to be updated with the new `users` table definition.
- **Data Migration**: Existing development/production databases will need to have their schemas migrated or recreated to accommodate the new fields.
- **Backend**: Any existing user creation or fetching logic will need to handle the new fields (especially the `google_id`).