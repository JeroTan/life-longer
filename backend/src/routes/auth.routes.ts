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

    app.post("/register", async ({ body, set }) => {
      return await authController.register(body, set);
    }, {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String()
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Register User',
        description: 'Registers a new user with email and password.'
      }
    });

    app.post("/login", async ({ body, set }) => {
      return await authController.login(body, set);
    }, {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String()
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Login User',
        description: 'Authenticates a user with email and password, returning a JWT.'
      }
    });

    app.post("/forgot-password", async ({ body, set }) => {
      return await authController.forgotPassword(body, set);
    }, {
      body: t.Object({
        email: t.String({ format: "email" })
      }),
      detail: {
        tags: ['Auth'],
        summary: 'Forgot Password',
        description: 'Initiates a password reset request.'
      }
    });

    return app;
  });
}
