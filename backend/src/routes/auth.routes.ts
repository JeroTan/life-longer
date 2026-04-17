import { Elysia, t } from "elysia";
import { AuthController } from "../controller/AuthController";
import { mainApp } from "../main";

export function AuthRoutes({ authController }: { authController: AuthController }) {
  mainApp.group("/auth", (app) => {
    app.get("/google", async ({ redirect }) => {
      return await authController.getGoogleLoginUrl(redirect);
    }, {
      detail: {
        tags: ['Auth'],
        summary: 'Initiate Google Login',
        description: 'Redirects the user to the Google OAuth2 consent screen.'
      }
    });

    app.get("/callback/google", async ({ query, request, redirect, set }) => {
      return await authController.handleGoogleCallback(query.code, request, redirect, set);
    }, {
      query: t.Object({
        code: t.Optional(t.String()),
        state: t.Optional(t.String())
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Google Login Callback',
        description: 'Handles the Google OAuth2 callback, creates or updates the user, and redirects to the app deep link with a JWT token.'
      }
    });

    return app;
  });
}
