import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import { users, processedWebhooks, creditLedger } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export class PaymentService {
  async createCheckout(userId: string, variantId: string) {
    const res = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Accept: "application/vnd.api+json",
        "Content-Type": "application/vnd.api+json",
        Authorization: `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              custom: {
                user_id: userId,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: env.LEMON_SQUEEZY_STORE_ID || "1", // Replace with real store ID if available
              },
            },
            variant: {
              data: {
                type: "variants",
                id: variantId,
              },
            },
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Failed to create checkout: ${await res.text()}`);
    }

    const data = (await res.json()) as any;
    return data.data.attributes.url;
  }

  async verifyWebhookSignature(signature: string, payload: string, secret: string) {
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );

    // Convert hex signature to Uint8Array
    const signatureBytes = new Uint8Array(signature.length / 2);
    for (let i = 0; i < signatureBytes.length; i++) {
      signatureBytes[i] = parseInt(signature.slice(i * 2, i * 2 + 2), 16);
    }

    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      encoder.encode(payload),
    );

    return isValid;
  }

  async processWebhook(signature: string | null, rawBody: string, d1Db: D1Database) {
    if (!signature) throw new Error("Missing X-Signature");

    const isValid = await this.verifyWebhookSignature(
      signature,
      rawBody,
      env.LEMON_SQUEEZY_WEBHOOK_SECRET,
    );
    if (!isValid) throw new Error("Invalid signature");

    const payload = JSON.parse(rawBody);
    const webhookId = payload.meta.webhook_id;
    const eventName = payload.meta.event_name;
    const customData = payload.meta.custom_data || {};
    const userId = customData.user_id;

    if (!userId) {
      return { message: "No user_id in custom_data, ignoring" };
    }

    const db = drizzle(d1Db);

    // Idempotency check
    const processed = await db
      .select({ webhookId: processedWebhooks.webhookId })
      .from(processedWebhooks)
      .where(eq(processedWebhooks.webhookId, webhookId))
      .get();

    if (processed) {
      return { message: "Webhook already processed" };
    }

    const variantId =
      payload.data?.attributes?.first_order_item?.variant_id?.toString() ||
      payload.data?.relationships?.variant?.data?.id?.toString();

    // Default queries
    const queries: any[] = [];
    queries.push(
      db.insert(processedWebhooks).values({
        webhookId,
        eventName,
      }),
    );

    if (eventName === "order_created" || eventName === "subscription_created") {
      if (variantId === "50_CREDITS_VARIANT_ID") {
        queries.push(
          db.update(users)
            .set({ credits: sql`${users.credits} + 50` })
            .where(eq(users.id, userId)),
        );
        queries.push(
          db.insert(creditLedger).values({
            userId,
            amount: 50,
            reason: eventName,
            referenceId: webhookId,
          }),
        );
      } else if (variantId === "MAX_STORAGE_VARIANT_ID") {
        queries.push(
          db.update(users)
            .set({ maxSavedAnalyses: 20 })
            .where(eq(users.id, userId)),
        );
        queries.push(
          db.insert(creditLedger).values({
            userId,
            amount: 0,
            reason: eventName + "_storage_upgrade",
            referenceId: webhookId,
          }),
        );
      }
    }

    await db.batch(queries as any);

    return { message: "Webhook processed" };
  }
}
