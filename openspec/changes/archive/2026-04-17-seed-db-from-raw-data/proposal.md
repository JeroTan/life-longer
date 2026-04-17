## Why

The database schema has been successfully initialized, but the tables are currently empty. To support the application's core functionality—analyzing user health data and recommending protocols—we need to seed the `biomarkers`, `interventions`, and `biomarker_interventions` tables using the scientific reference data provided in the `.raw-data/` directory.

## What Changes

- Utilize the `biolearn` Python library to extract and format massive datasets (like NHANES) into CSV format within the `.raw-data/` directory.
- Implement a data processing script (or D1 seeder) that parses various JSON, CSV, and HTML files located in the `.raw-data/` directory.
- Map the parsed data entities to our specific schema structure (`biomarkers` and `interventions`).
- Construct and insert the relationships (`biomarker_interventions`) between the seeded biomarkers and interventions.
- Execute the seeding process against the configured D1 database.

## Capabilities

### New Capabilities

- `db-seeding`: The capability to ingest raw scientific data (including biolearn extracted datasets) and populate the database with biomarkers, interventions, and their proven relationships.

### Modified Capabilities

## Impact

- The development D1 database (`life-longer-db-development`) will be populated with comprehensive scientific reference data.
- New scripts or tooling will be added to the codebase to handle the ingestion and normalization of raw datasets.
