## ADDED Requirements

### Requirement: Google Auth Schema Fields
The system SHALL store Google authentication details for users, specifically their unique Google ID, name, and profile picture URL.

#### Scenario: User signs up with Google
- **WHEN** a new user signs up using Google OAuth
- **THEN** their `google_id`, `email`, `name`, and `picture` are successfully persisted in the database.

#### Scenario: Unique Google ID constraint
- **WHEN** a user record is created
- **THEN** the `google_id` MUST be unique across all user records to prevent account duplication.