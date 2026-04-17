## ADDED Requirements

### Requirement: Database Abstraction
The system SHALL use Drizzle ORM for all database interactions instead of raw SQL queries.

#### Scenario: Query execution
- **WHEN** a service needs to query or mutate the database
- **THEN** it MUST use Drizzle ORM query builders (e.g., `db.select()`, `db.insert()`, `db.update()`).

### Requirement: Separation of Concerns
Services SHALL NOT contain HTTP-specific logic (like returning Response objects or HTTP status codes). Controllers SHALL handle all HTTP responses.

#### Scenario: Service error handling
- **WHEN** a business rule fails in a service (e.g., insufficient credits)
- **THEN** the service MUST throw an Error and the controller (or global error handler) MUST map it to the appropriate HTTP status code (e.g., 402).
