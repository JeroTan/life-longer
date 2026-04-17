import { calculatePhenoAge, Biomarkers } from "../lib/math/phenoage";
import { drizzle } from "drizzle-orm/d1";
import { users, savedAnalyses, creditLedger } from "../db/schema";
import { eq, sql, desc, count } from "drizzle-orm";

export class AnalysisService {
  async runAnalysis(userId: string, data: Biomarkers, d1Db: D1Database) {
    const db = drizzle(d1Db);
    const user = await db
      .select({ credits: users.credits })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user || user.credits <= 0) {
      throw new Error("Payment Required");
    }

    // Deduct credit atomically
    const queries: any[] = [
      db.update(users).set({ credits: sql`${users.credits} - 1` }).where(sql`${users.id} = ${userId} AND ${users.credits} > 0`),
      db.insert(creditLedger).values({ userId, amount: -1, reason: "analysis_run" }),
    ];

    const results = await db.batch(queries as any);
    if (!results || results.length === 0 || (results[0] as any).meta?.changes === 0) {
       throw new Error("Payment Required"); // Double check to prevent race condition
    }

    const result = calculatePhenoAge(data);
    return result;
  }

  async saveAnalysis(userId: string, analysisData: string, d1Db: D1Database) {
    const db = drizzle(d1Db);
    const user = await db
      .select({ maxSavedAnalyses: users.maxSavedAnalyses })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) throw new Error("User not found");

    const countRes = await db
      .select({ count: count() })
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .get();

    const currentCount = countRes ? countRes.count : 0;

    if (currentCount >= user.maxSavedAnalyses) {
      throw new Error("Storage limit reached");
    }

    await db.insert(savedAnalyses).values({
      userId,
      analysisData
    }).execute();

    return { success: true };
  }

  async getHistory(userId: string, d1Db: D1Database) {
    const db = drizzle(d1Db);
    const history = await db
      .select()
      .from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .orderBy(desc(savedAnalyses.savedAt))
      .all();

    return history;
  }
}
