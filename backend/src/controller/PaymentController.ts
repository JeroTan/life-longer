import { PaymentService } from "../services/PaymentService";
import { env } from "cloudflare:workers";

export class PaymentController {
  constructor(protected paymentService: PaymentService) {}

  async createCheckout(userId: string, variantId: string) {
    return await this.paymentService.createCheckout(userId, variantId);
  }

  async processWebhook(signature: string | null, rawBody: string, set: any) {
    try {
      const result = await this.paymentService.processWebhook(signature, rawBody, env.DB);
      set.status = 200;
      return result;
    } catch (err: any) {
      if (err.message === "Invalid signature" || err.message === "Missing X-Signature") {
        set.status = 401;
        return { error: err.message };
      }
      set.status = 500;
      return { error: "Internal server error" };
    }
  }
}
