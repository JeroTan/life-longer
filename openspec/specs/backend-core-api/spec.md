## ADDED Requirements

### Requirement: Google OAuth Flow

The system SHALL support Google OAuth2 for user registration and login.

#### Scenario: User initiates login

- **WHEN** a request is made to `/auth/google`
- **THEN** the system MUST redirect the user to the Google OAuth consent screen with the correct scopes.

#### Scenario: Successful Google callback

- **WHEN** a valid code is returned to `/auth/callback/google`
- **THEN** the system MUST fetch the user's profile, create a database record if one does not exist, and redirect to the mobile app deep link containing a valid JWT.

### Requirement: Stateless JWT Authentication

The system SHALL secure protected routes using stateless JWTs.

#### Scenario: Requesting a protected route with a valid token

- **WHEN** a valid JWT is provided in the `Authorization: Bearer` header
- **THEN** the middleware MUST inject the `user_id` into the request context and allow the request to proceed.

#### Scenario: Requesting a protected route with an invalid token

- **WHEN** an invalid or missing JWT is provided
- **THEN** the system MUST return a 401 Unauthorized response.

### Requirement: Lemon Squeezy Webhooks

The system SHALL process Lemon Squeezy webhooks securely and idempotently.

#### Scenario: Valid webhook for adding credits

- **WHEN** a valid webhook with a correct HMAC signature is received for the credits variant
- **THEN** the system MUST idempotently add 50 credits to the user and log the transaction.

#### Scenario: Invalid webhook signature

- **WHEN** a webhook is received with an invalid `X-Signature`
- **THEN** the system MUST reject the request with a 401 response.

### Requirement: Phenotypic Age Analysis

The system SHALL calculate Phenotypic Age and Mortality Score based on biological inputs.

#### Scenario: Running analysis with sufficient credits

- **WHEN** a valid set of 9 biomarkers is submitted and the user has > 0 credits
- **THEN** the system MUST calculate the scores, deduct 1 credit atomically, and return the result.

#### Scenario: Running analysis without credits

- **WHEN** a user with 0 credits attempts to run an analysis
- **THEN** the system MUST return a 402 Payment Required response.
