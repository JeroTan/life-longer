import openapi from "@elysiajs/openapi";
import { Elysia } from "elysia";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { cors } from "@elysiajs/cors";
import { Container } from "./container";

export const mainApp = new Elysia({ adapter: CloudflareAdapter, aot: false, normalize: true })
  .use(cors())
  .use(openapi({
    documentation: {
      info: {
        title: "LifeLonger API",
        version: "1.0.0",
        description: "API for the LifeLonger native mobile app"
      },
      components: {
        securitySchemes: {
          BearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  }))
  .onError(({ code, error, set }) => {
    // Custom handling for known errors, e.g., validation, custom AuthError, etc.
    let status = 500;
    
    // AuthError from our auth plugin
    if ((error as Error).name === "AuthError") {
      status = 401;
    } else if (code === "NOT_FOUND") {
      status = 404;
    } else if (code === "VALIDATION") {
      status = 400;
    } else if ((error as any).status) {
      status = (error as any).status;
    }

    set.status = status;

    return {
      success: false,
      error: {
        code,
        message: (error as Error).message || "Internal Server Error"
      }
    };
  });

Container(mainApp);
