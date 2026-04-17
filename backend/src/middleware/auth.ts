import { Elysia } from "elysia";
import { jwtDecrypt } from "../lib/crypto/jwt";
import { env } from "cloudflare:workers";

// Custom error for authentication failures
class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

export const authPlugin = new Elysia()
  .derive({ as: "scoped" }, async ({ request }) => {
    const authHeader = request.headers.get("Authorization");
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new AuthError("Missing or invalid Authorization header");
    }

    const token = authHeader.split(" ")[1];
    
    // Use the jwtDecrypt utility
    const result = await jwtDecrypt<{ id: string }>({
      token,
      secretKey: env.JWT_SECRET
    });

    if (result.error || !result.data) {
      throw new AuthError(result.error || "Invalid token");
    }

    return {
      userId: result.data.id
    };
  });