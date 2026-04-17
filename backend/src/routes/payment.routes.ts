import { Elysia, t } from "elysia";
import { PaymentController } from "../controller/PaymentController";
import { mainApp } from "../main";
import { authPlugin } from "../middleware/auth";

export function PaymentRoutes({ paymentController }: { paymentController: PaymentController }) {
  mainApp.group("/api", (app) => {
    // Protected routes
    app.use(authPlugin).post(
      "/checkout",
      async ({ userId, body }) => {
        const url = await paymentController.createCheckout(userId, body.variant_id);
        return { url };
      },
      {
        body: t.Object({
          variant_id: t.String(),
        }),
        detail: {
          tags: ["Payment"],
          summary: "Create Checkout URL",
          description:
            "Generates a Lemon Squeezy checkout URL for purchasing credits or storage upgrades.",
          security: [{ BearerAuth: [] }],
        },
      },
    );

    return app;
  });

  // Public webhook route (must get raw text body for HMAC)
  mainApp.group("/api/webhooks", (app) => {
    app.post(
      "/lemonsqueezy",
      async ({ request, body, set }) => {
        const signature = request.headers.get("X-Signature");
        const rawBody = body as string;
        return await paymentController.processWebhook(signature, rawBody, set);
      },
      {
        parse: "text",
        detail: {
          tags: ["Webhooks"],
          summary: "Lemon Squeezy Webhook",
          description:
            "Processes incoming webhooks from Lemon Squeezy to update user credits or storage.",
        },
      },
    );

    return app;
  });
}
