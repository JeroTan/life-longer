## ADDED Requirements

### Requirement: Extract Datasets using Biolearn

The system SHALL support extracting massive datasets (e.g., NHANES) using the open-source `biolearn` Python library and outputting them as CSVs into the `.raw-data` directory.

#### Scenario: Biolearn Extraction

- **WHEN** the Python extraction script is executed
- **THEN** it downloads and harmonizes the datasets via `biolearn` and outputs a `.csv` file.

### Requirement: Ingest Biomarkers

The system SHALL support parsing biomarker entities from raw data files and inserting them into the database.

#### Scenario: Seeding Biomarkers

- **WHEN** the seed script processes `Aging_Biomarkers.json`
- **THEN** it extracts unique biomarker names and categories and writes them to the `biomarkers` table.

### Requirement: Ingest Interventions

The system SHALL support parsing intervention entities from raw data files (like drugs) and inserting them into the database.

#### Scenario: Seeding Interventions

- **WHEN** the seed script processes `drugage.csv`
- **THEN** it extracts unique compound names as interventions and writes them to the `interventions` table.

### Requirement: Idempotent Insertion

The seeding script SHALL be idempotent and not fail or duplicate data if run multiple times.

#### Scenario: Re-running the seeder

- **WHEN** the script is executed against an already seeded database
- **THEN** it does not duplicate existing biomarkers or interventions.
