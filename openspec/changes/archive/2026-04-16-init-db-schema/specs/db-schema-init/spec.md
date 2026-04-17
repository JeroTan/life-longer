## ADDED Requirements

### Requirement: Database Schema Initialization

The development environment SHALL have its database initialized with the schema matching the state defined in `schema/schema.sql`.

#### Scenario: Developer applies schema

- **WHEN** the developer executes the Wrangler command to apply the schema to the remote dev database
- **THEN** all tables defined in `schema.sql` are created in the D1 development database successfully.

### Requirement: Schema Documentation

The project SHALL contain a documentation file explaining the database schema in the `./docs/` directory.

#### Scenario: Developer reads documentation

- **WHEN** a developer views `docs/database-schema.md`
- **THEN** they can understand the purpose of each table and how they relate to one another.
