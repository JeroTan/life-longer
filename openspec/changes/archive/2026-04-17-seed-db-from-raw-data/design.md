## Context

The backend utilizes Cloudflare D1 for its database. Currently, the schema is applied, but the tables are empty. We have a robust dataset inside `.raw-data/` containing scientific literature, clinical trials, and drug age databases (e.g., `Aging_Biomarkers.json`, `drugage.csv`, `studies.json`). In addition, we need to extract large datasets (like NHANES) using the `biolearn` Python library. We need a programmatic way to ingest this raw data and seed our `biomarkers`, `interventions`, and `biomarker_interventions` tables.

## Goals / Non-Goals

**Goals:**

- Create a Python script (`extract_biolearn.py`) that utilizes `biolearn` to extract massive datasets into `.csv` format inside `.raw-data/biolearn-library/`.
- Create a `seed.ts` script in the backend project to parse JSON and CSV files from the `.raw-data/` directory (including the newly extracted biolearn CSVs).
- Insert unique records into the `biomarkers` table.
- Insert unique records into the `interventions` table.
- Map and insert relational records into the `biomarker_interventions` table where applicable.

**Non-Goals:**

- Creating a dynamic daily ingestion pipeline. This is a one-off or occasional script to seed the database.
- Normalizing the raw data flawlessly. We will rely on simple deduplication (e.g., using SQL `INSERT OR IGNORE`).

## Decisions

- **Execution Environment**:
  - **Extraction**: We will use a Python environment to `pip install biolearn` and execute a script to save the NHANES/Framingham data as CSVs.
  - **Seeding**: The actual seeding will be a Node.js/TypeScript script that generates SQL `INSERT` statements and writes them to a `.sql` file to be executed via `wrangler d1 execute`. Using `wrangler d1 execute` is the preferred approach for simplicity and security.
- **Data Mapping**:
  - `Aging_Biomarkers.json`: The `source` keys will be extracted and seeded as `biomarkers` with the category `Gene` or `Lipid` based on `source type`.
  - `drugage.csv`: The `compound_name` column will be extracted and seeded as `interventions` with the type `Drug`.
  - The script will read files sequentially to avoid memory pressure and will write out a `seed.sql` file.

## Risks / Trade-offs

- **Risk**: The raw data contains thousands of records which could lead to a massive SQL file.
  - **Mitigation**: We will split the SQL insertions into batches (e.g., 500 rows per `INSERT` statement) to avoid command-line argument limits or query payload limits in Cloudflare D1.
- **Risk**: Duplicated entries in raw data.
  - **Mitigation**: Use SQL `INSERT OR IGNORE INTO` syntax or deduplicate records using a `Set` in TypeScript before generating the SQL.
