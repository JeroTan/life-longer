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

  async register(body: any, set: any) {
    try {
      const jwt = await this.authService.registerUser(body.email, body.password, env.DB);
      set.status = 201;
      return { token: jwt };
    } catch (err: any) {
      if (err.message === "Email already in use") {
        set.status = 400;
        return { error: err.message };
      }
      set.status = 500;
      return { error: err.message || "Registration failed" };
    }
  }

  async login(body: any, set: any) {
    try {
      const jwt = await this.authService.loginUser(body.email, body.password, env.DB);
      return { token: jwt };
    } catch (err: any) {
      if (err.message === "Invalid email or password") {
        set.status = 401;
        return { error: err.message };
      }
      set.status = 500;
      return { error: err.message || "Login failed" };
    }
  }

  async forgotPassword(body: any, set: any) {
    try {
      await this.authService.forgotPassword(body.email, env.DB);
      return { message: "Password reset request processed" };
    } catch (err: any) {
      set.status = 500;
      return { error: err.message || "Request failed" };
    }
  }
}
