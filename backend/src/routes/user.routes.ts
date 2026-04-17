import { Elysia } from "elysia";
import { UserController } from "../controller/UserController";
import { mainApp } from "../main";
import { authPlugin } from "../middleware/auth";

export function UserRoutes({ userController }: { userController: UserController }) {
  mainApp.group("/api/user", (app) => {
    app.use(authPlugin).get("/me", async ({ userId, set }) => {
      return await userController.getMe(userId, set);
    }, {
      detail: {
        tags: ['User'],
        summary: 'Get Current User',
        description: 'Returns the currently authenticated user profile, credits balance, and storage limits.',
        security: [{ BearerAuth: [] }]
      }
    });

    return app;
  });
}
