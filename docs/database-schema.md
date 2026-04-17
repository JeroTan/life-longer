# LifeLonger Database Schema Documentation

This document describes the database schema used in the LifeLonger project. The database is hosted on Cloudflare D1 (SQLite).

## Tables Overview

### 1. `users`
Tracks user identity, credits, and storage limits for saved analyses. Supports both Google OAuth and native email/password auth.
- `id` (TEXT, PK): Unique identifier for the user (UUID).
- `google_id` (TEXT, UNIQUE, NULLABLE): Unique identifier for the user from Google. Optional if using email/password.
- `password` (TEXT, NULLABLE): Salted SHA-256 hashed password. Format: `salt$hash`. Optional if using Google OAuth.
- `email` (TEXT, UNIQUE): User's email address.
- `name` (TEXT, NULLABLE): User's full name (provided by Google profile).
- `picture` (TEXT, NULLABLE): URL to the user's profile picture (provided by Google profile).
- `credits` (INTEGER): Available credits for analysis (default: 3).
- `max_saved_analyses` (INTEGER): Freemium storage limit for saved analyses (default: 3).
- `created_at` (DATETIME): Timestamp when the user was created.

### 2. `biomarkers`

Scientific reference data for various health biomarkers.

- `id` (INTEGER, PK, AUTOINCREMENT): Unique identifier for the biomarker.
- `name` (TEXT): Name of the biomarker.
- `category` (TEXT): Category (e.g., Blood, Wearable).
- `optimal_range` (TEXT): Scientific optimal range.
- `standard_range` (TEXT): Standard laboratory reference range.

### 3. `interventions`

GRADE-assessed protocols and interventions.

- `id` (INTEGER, PK, AUTOINCREMENT): Unique identifier for the intervention.
- `name` (TEXT): Name of the intervention (e.g., Supplement, Lifestyle change).
- `type` (TEXT): Type of intervention.
- `grade_evidence` (TEXT): GRADE evidence assessment.
- `target_mechanism` (TEXT): Biological mechanism targeted.

### 4. `biomarker_interventions`

Relational mapping linking biomarkers to proven interventions.

- `biomarker_id` (INTEGER, FK): Reference to `biomarkers(id)`.
- `intervention_id` (INTEGER, FK): Reference to `interventions(id)`.
- **Primary Key**: (`biomarker_id`, `intervention_id`).

### 5. `user_biomarker_logs`

User-logged bloodwork or wearable data.

- `id` (INTEGER, PK, AUTOINCREMENT): Unique identifier for the log entry.
- `user_id` (TEXT, FK): Reference to `users(id)`.
- `biomarker_id` (INTEGER, FK): Reference to `biomarkers(id)`.
- `recorded_value` (REAL): The measured value.
- `logged_at` (DATETIME): Timestamp when the data was logged.

### 6. `saved_analyses`

Freemium storage for user analysis results and protocols.

- `id` (INTEGER, PK, AUTOINCREMENT): Unique identifier for the saved analysis.
- `user_id` (TEXT, FK): Reference to `users(id)`.
- `analysis_data` (TEXT): JSON/text result of the L-II score and protocol plan.
- `saved_at` (DATETIME): Timestamp when the analysis was saved.

### 7. `processed_webhooks`

Ensures idempotency for external service webhooks (e.g., Lemon Squeezy).

- `webhook_id` (TEXT, PK): Unique identifier for the webhook event.
- `event_name` (TEXT): Name of the event.
- `processed_at` (DATETIME): Timestamp when the event was processed.

### 8. `credit_ledger`

Immutable audit trail for all credit-related transactions.

- `id` (INTEGER, PK, AUTOINCREMENT): Unique identifier for the ledger entry.
- `user_id` (TEXT, FK): Reference to `users(id)`.
- `amount` (INTEGER): Amount of credits changed (positive for top-ups, negative for usage).
- `reason` (TEXT): Reason for the change (e.g., 'lemon_squeezy_purchase', 'biomarker_analysis').
- `reference_id` (TEXT): External reference ID (e.g., Order ID).
- `created_at` (DATETIME): Timestamp of the transaction.
