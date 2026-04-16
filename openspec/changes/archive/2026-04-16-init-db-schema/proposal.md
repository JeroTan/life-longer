## Why

We need to initialize the development database with our schema so that local/remote development can proceed with the correct tables and relationships. Alongside the schema initialization, comprehensive documentation is needed to explain the purpose of the database tables and their relationships for future developers.

## What Changes

- Execute `schema/schema.sql` against the development D1 database via Wrangler.
- Create comprehensive schema documentation in the `./docs/` directory explaining the database structure, tables, and relationships.

## Capabilities

### New Capabilities
- `db-schema-init`: The capability to initialize the database schema and maintain its documentation.

### Modified Capabilities

## Impact

- The development D1 database (`life-longer-db-development`) will have the correct tables created (users, biomarkers, interventions, etc.).
- A new documentation file will be added to `./docs/` for reference.
