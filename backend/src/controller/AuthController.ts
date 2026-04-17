import { AuthService } from "../services/AuthService";
import { env } from "cloudflare:workers";

export class AuthController {
  constructor(protected authService: AuthService) {}

  async getGoogleLoginUrl(redirect: any) {
    const url = await this.authService.getGoogleAuthUrl();
    return redirect(url, 302);
  }

  async handleGoogleCallback(code: string | undefined, request: Request, redirect: any, set: any) {
    if (!code) {
      set.status = 400;
      return { error: "Missing code" };
    }
    try {
      const url = new URL(request.url);
      const redirectUri = `${url.origin}/auth/callback/google`;
      const jwt = await this.authService.handleGoogleCallback(code, redirectUri, env.DB);
      return redirect(`lifelonger://login?token=${jwt}`, 302);
    } catch (err: any) {
      set.status = 500;
      return { error: err.message || "Auth failed" };
    }
  }
}
