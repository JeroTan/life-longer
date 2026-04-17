## Context

The backend is built using Cloudflare Workers and D1 database. The schema is defined in `schema/schema.sql`. The development environment needs this schema applied to the remote development database instance (`life-longer-db-development`) so that developers have a functioning remote development environment. Additionally, we need documentation on the schema.

## Goals / Non-Goals

**Goals:**

- Apply the existing `schema/schema.sql` to the D1 development database.
- Document the schema and table relationships in the `docs` folder.

**Non-Goals:**

- Modifying the existing schema or tables in this change.
- Applying schema to the production database in this change.

## Decisions

- **Execution**: We will use `wrangler d1 execute` command with the appropriate DB binding from `backend/wrangler.jsonc` to apply the `schema.sql` file to the remote development database.
- **Documentation**: We will create `docs/database-schema.md` outlining the tables (Users, Biomarkers, Interventions, User Logs, Saved Analyses, Webhooks, Credit Ledger) and their primary purpose and foreign keys based on `schema.sql`.

## Risks / Trade-offs

- **Risk**: Overwriting existing development data if the `DROP TABLE` commands execute.
  - **Mitigation**: This is explicitly an initialization for the development environment. It is accepted that the dev DB can be wiped and re-created safely. In a production environment, migrations would be used.
