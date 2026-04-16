//@ts-nocheck


import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const biolearnCsvPath = path.join(__dirname, '../../../.raw-data/biolearn-library/GSE41169_metadata.csv');
const agingBiomarkersJsonPath = path.join(__dirname, '../../../.raw-data/Human Aging and longevity landscape/Aging_Biomarkers.json');
const drugageCsvPath = path.join(__dirname, '../../../.raw-data/DrugAge The Database of Ageing-related Drugs/drugage.csv');
const outputPath = path.join(__dirname, 'seed.sql');

interface Biomarker {
  name: string;
  category: string;
}

interface Intervention {
  name: string;
  type: string;
}

async function main() {
  const biomarkers = new Map<string, Biomarker>();
  const interventions = new Map<string, Intervention>();

  // 1. Parse Biolearn CSV
  console.log('Parsing Biolearn CSV...');
  if (fs.existsSync(biolearnCsvPath)) {
    const fileContent = fs.readFileSync(biolearnCsvPath, 'utf8');
    const headers = fileContent.split('\n')[0].split(',').map(h => h.trim());
    for (const h of headers) {
      if (h && h !== 'id' && h !== '') {
        biomarkers.set(h, { name: h, category: 'Clinical/Biolearn' });
      }
    }
  } else {
    console.log('Biolearn CSV not found, skipping...');
  }

  // 2. Parse Aging_Biomarkers.json
  console.log('Parsing Aging_Biomarkers.json...');
  if (fs.existsSync(agingBiomarkersJsonPath)) {
    const rawData = fs.readFileSync(agingBiomarkersJsonPath, 'utf8');
    const json = JSON.parse(rawData);
    for (const key of Object.keys(json)) {
      const items = json[key];
      if (items.length > 0) {
        const type = items[0]['source type'] || 'Gene';
        const name = items[0]['source'] || key;
        biomarkers.set(name, { name, category: type });
      }
    }
  } else {
    console.log('Aging_Biomarkers.json not found, skipping...');
  }

  // 3. Parse drugage.csv
  console.log('Parsing drugage.csv...');
  await new Promise<void>((resolve, reject) => {
    if (!fs.existsSync(drugageCsvPath)) {
      console.log('drugage.csv not found, skipping...');
      return resolve();
    }
    fs.createReadStream(drugageCsvPath)
      .pipe(csv())
      .on('data', (data) => {
        if (data.compound_name) {
          const name = data.compound_name.trim();
          interventions.set(name, { name, type: 'Drug' });
        }
      })
      .on('end', resolve)
      .on('error', reject);
  });

  // 4. Generate SQL
  console.log('Generating SQL...');
  let sql = '-- Auto-generated seed file\n\n';

  const escapeSql = (str: string) => str.replace(/'/g, "''");

  // Biomarkers
  const bList = Array.from(biomarkers.values());
  for (let i = 0; i < bList.length; i += 500) {
    const batch = bList.slice(i, i + 500);
    const values = batch.map(b => `('${escapeSql(b.name)}', '${escapeSql(b.category)}')`).join(',\n  ');
    sql += `INSERT OR IGNORE INTO biomarkers (name, category) VALUES\n  ${values};\n\n`;
  }

  // Interventions
  const iList = Array.from(interventions.values());
  for (let i = 0; i < iList.length; i += 500) {
    const batch = iList.slice(i, i + 500);
    const values = batch.map(b => `('${escapeSql(b.name)}', '${escapeSql(b.type)}', 'Pending', 'Unknown')`).join(',\n  ');
    sql += `INSERT OR IGNORE INTO interventions (name, type, grade_evidence, target_mechanism) VALUES\n  ${values};\n\n`;
  }

  // Relationships (No explicit mappings exist between these datasets, so we rely on schema defaults)
  sql += `-- Relationships omitted as exact mapping data is unavailable between DrugAge and Aging_Biomarkers\n`;

  fs.writeFileSync(outputPath, sql, 'utf8');
  console.log(`Saved SQL statements to ${outputPath}`);
}

main().catch(console.error);