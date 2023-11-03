import { Context } from "koa";
import { UserService } from "../services/user.service";

class UserController {
  private userService = new UserService();

  public async getUserDetails(ctx: Context) {
    const userEmail = ctx.request.query.userEmail as string;
    if (!userEmail) {
      ctx.body = "No user email provided";
      return;
    }

    const user = await this.userService.getUserGraphDetailsByEmail(userEmail);
    ctx.body = user;
  }

  public async getUsersSchedule(ctx: Context) {
    const startDate = ctx.request.query.startDate as string;
    const endDate = ctx.request.query.endDate as string;
    const userEmail = ctx.request.query.userEmail as string;

    if (!startDate || !endDate || !userEmail) {
      ctx.body = "Invalid query parameters";
      return;
    }

    const schedule = await this.userService.getUsersSchedule(
      startDate,
      endDate,
      userEmail
    );

    ctx.body = schedule;
  }
}

export default new UserController();
