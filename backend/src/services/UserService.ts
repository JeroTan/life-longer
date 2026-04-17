import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class UserService {
  async getUser(userId: string, d1Db: D1Database) {
    const db = drizzle(d1Db);
    const user = await db
      .select({
        name: users.name,
        email: users.email,
        credits: users.credits,
        maxSavedAnalyses: users.maxSavedAnalyses
      })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  }
}
