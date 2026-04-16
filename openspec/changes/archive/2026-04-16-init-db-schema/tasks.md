## 1. Database Initialization

- [x] 1.1 Execute `schema/schema.sql` against the development D1 database via Wrangler (`cd backend && npx wrangler d1 execute DB --env development --remote --file=../schema/schema.sql`).

## 2. Schema Documentation

- [x] 2.1 Create the `docs/database-schema.md` file.
- [x] 2.2 Add documentation for the `users`, `biomarkers`, and `interventions` tables.
- [x] 2.3 Add documentation for the `biomarker_interventions`, `user_biomarker_logs`, and `saved_analyses` tables.
- [x] 2.4 Add documentation for the `processed_webhooks` and `credit_ledger` tables, explaining their purpose in idempotency and audit trails.
