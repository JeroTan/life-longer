## ADDED Requirements

### Requirement: Email Registration
The system SHALL allow users to register an account using an email address and a password.

#### Scenario: Successful registration
- **WHEN** a user submits a valid email and password to `/auth/register`
- **THEN** the system MUST hash the password, create a new user record without a `google_id`, and return a valid JWT token.

#### Scenario: Duplicate email registration
- **WHEN** a user attempts to register with an email that is already in use
- **THEN** the system MUST return a 400 Bad Request indicating the email is taken.

### Requirement: Password Login
The system SHALL allow users to authenticate using their email and password.

#### Scenario: Successful login
- **WHEN** a user submits correct email and password credentials to `/auth/login`
- **THEN** the system MUST verify the password hash and return a valid JWT token.

#### Scenario: Invalid credentials
- **WHEN** a user submits an incorrect email or password to `/auth/login`
- **THEN** the system MUST return a 401 Unauthorized status.

### Requirement: Forgot Password
The system SHALL provide an endpoint to initiate a password reset request.

#### Scenario: Requesting password reset
- **WHEN** a user submits an email to `/auth/forgot-password`
- **THEN** the system MUST acknowledge the request with a 200 OK status (and optionally log the request).
