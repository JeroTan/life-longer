## ADDED Requirements

### Requirement: API Test Suite
The system SHALL include an automated test suite that verifies the core functionality of the API endpoints.

#### Scenario: Running the test suite
- **WHEN** a developer runs the `npm run test` command
- **THEN** the test suite executes and validates the Auth, User, Payment, and Analysis endpoints.

### Requirement: Auth Endpoint Verification
The test suite SHALL verify the Google OAuth redirection and callback logic.

#### Scenario: Testing Google Callback
- **WHEN** the `/auth/callback/google` endpoint is called with a mock code
- **THEN** it should successfully return a redirect response containing a JWT token.

### Requirement: Protected Endpoint Verification
The test suite SHALL verify that protected endpoints reject unauthorized requests.

#### Scenario: Unauthorized Access
- **WHEN** a request is made to `/api/user/me` without a valid `Authorization` header
- **THEN** the endpoint should return a 401 Unauthorized status code.
