## 1. Biolearn Data Extraction

- [x] 1.1 Set up a Python environment (e.g., `.venv`) and `pip install biolearn` and `pandas`.
- [x] 1.2 Write `extract_biolearn.py` to extract NHANES (or Framingham) datasets into CSV format within `.raw-data/biolearn-library/`.
- [x] 1.3 Execute `extract_biolearn.py` to generate the raw CSV data.

## 2. Setup Seeding Infrastructure

- [x] 2.1 Create a new directory `backend/src/scripts/` to house the Node.js seeding scripts.
- [x] 2.2 Create `seed.ts` script file and ensure any required parsing libraries (e.g., `csv-parser`) are installed in the backend `package.json`.

## 3. Parse Raw Data

- [x] 3.1 Implement logic in `seed.ts` to parse the newly generated Biolearn CSV data and extract biomarkers/metrics.
- [x] 3.2 Implement logic in `seed.ts` to parse `Aging_Biomarkers.json` and extract unique biomarkers.
- [x] 3.3 Implement logic in `seed.ts` to parse `drugage.csv` and extract unique interventions (drugs).
- [x] 3.4 Implement logic to map the relationships between biomarkers and interventions where possible.

## 4. Database Insertion

- [x] 4.1 Write logic to generate SQL `INSERT OR IGNORE` statements for the parsed biomarkers and interventions.
- [x] 4.2 Write logic to generate SQL `INSERT OR IGNORE` statements for the `biomarker_interventions` relations.
- [x] 4.3 Output the generated statements to a `seed.sql` file.

## 5. Execution

- [x] 5.1 Execute `npx wrangler d1 execute DB --env development --remote --file=./src/scripts/seed.sql` to populate the development database.
