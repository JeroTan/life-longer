import { UserService } from "../services/UserService";
import { env } from "cloudflare:workers";

export class UserController {
  constructor(protected userService: UserService) {}

  async getMe(userId: string, set: any) {
    try {
      return await this.userService.getUser(userId, env.DB);
    } catch (error: any) {
      if (error.message === "User not found") {
        set.status = 404;
        return { error: error.message };
      }
      set.status = 500;
      return { error: "Internal server error" };
    }
  }
}
