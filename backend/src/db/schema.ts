import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  googleId: text('google_id').unique(),
  password: text('password'),
  email: text('email').unique().notNull(),
  name: text('name'),
  picture: text('picture'),
  credits: integer('credits').default(0).notNull(),
  maxSavedAnalyses: integer('max_saved_analyses').default(3).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const biomarkers = sqliteTable('biomarkers', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  category: text('category').notNull(),
  optimalRange: text('optimal_range'),
  standardRange: text('standard_range')
});

export const interventions = sqliteTable('interventions', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  type: text('type').notNull(),
  gradeEvidence: text('grade_evidence').notNull(),
  targetMechanism: text('target_mechanism')
});

export const biomarkerInterventions = sqliteTable('biomarker_interventions', {
  biomarkerId: integer('biomarker_id').notNull().references(() => biomarkers.id, { onDelete: 'cascade' }),
  interventionId: integer('intervention_id').notNull().references(() => interventions.id, { onDelete: 'cascade' })
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.biomarkerId, table.interventionId] })
  };
});

export const userBiomarkerLogs = sqliteTable('user_biomarker_logs', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  biomarkerId: integer('biomarker_id').notNull().references(() => biomarkers.id, { onDelete: 'cascade' }),
  recordedValue: real('recorded_value').notNull(),
  loggedAt: integer('logged_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const savedAnalyses = sqliteTable('saved_analyses', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  analysisData: text('analysis_data').notNull(),
  savedAt: integer('saved_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const processedWebhooks = sqliteTable('processed_webhooks', {
  webhookId: text('webhook_id').primaryKey(),
  eventName: text('event_name').notNull(),
  processedAt: integer('processed_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull()
});

export const creditLedger = sqliteTable('credit_ledger', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  reason: text('reason').notNull(),
  referenceId: text('reference_id'),
  createdAt: integer('created_at', { mode: 'timestamp' }).default(sql`(CURRENT_TIMESTAMP)`).notNull()
});
