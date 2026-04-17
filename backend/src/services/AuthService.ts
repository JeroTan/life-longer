import { env } from "cloudflare:workers";
import { jwtEncrypt } from "../lib/crypto/jwt";
import { drizzle } from "drizzle-orm/d1";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";

export class AuthService {
  async getGoogleAuthUrl() {
    const rootUrl = "https://accounts.google.com/o/oauth2/v2/auth";
    const options = {
      redirect_uri: `https://${env.HOST || "life-longer-backend.jerowe-tan99.workers.dev"}/auth/callback/google`,
      client_id: env.GOOGLE_CLIENT_ID,
      access_type: "offline",
      response_type: "code",
      prompt: "consent",
      scope: [
        "https://www.googleapis.com/auth/userinfo.profile",
        "https://www.googleapis.com/auth/userinfo.email",
        "openid"
      ].join(" "),
    };
    
    const qs = new URLSearchParams(options);
    return `${rootUrl}?${qs.toString()}`;
  }

  async handleGoogleCallback(code: string, redirectUri: string, d1Db: D1Database) {
    const tokenUrl = "https://oauth2.googleapis.com/token";
    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      throw new Error("Failed to fetch Google OAuth tokens");
    }

    const tokenData = await tokenRes.json() as any;
    const accessToken = tokenData.access_token;

    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!userRes.ok) {
      throw new Error("Failed to fetch Google user profile");
    }

    const googleUser = await userRes.json() as any;
    const { id: google_id, email, name, picture } = googleUser;

    const db = drizzle(d1Db);

    // Query D1 by google_id using Drizzle
    let user = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.googleId, google_id))
      .get();

    if (!user) {
      const newUserId = crypto.randomUUID();
      await db.insert(users).values({
        id: newUserId,
        googleId: google_id,
        email,
        name,
        picture,
        credits: 0,
        maxSavedAnalyses: 3
      }).execute();
      
      user = { id: newUserId };
    } else {
      // Optionally update name/picture if changed
      await db.update(users)
        .set({ name, picture })
        .where(eq(users.id, user.id))
        .execute();
    }

    // Generate JWT
    const { data: jwt, error } = await jwtEncrypt({
      payload: { id: user.id },
      secretKey: env.JWT_SECRET,
      expiresInSeconds: 60 * 60 * 24 * 30 // 30 days
    });

    if (error || !jwt) {
      throw new Error("Failed to generate JWT: " + error);
    }

    return jwt;
  }
}
