import { Context } from "koa";
import { InvitationService } from "../services/invitation.service";
import { UserService } from "../services/user.service";
import { Database } from "../datasource";

class InvitationController {
  private invitationService: InvitationService = new InvitationService();
  private userService: UserService = new UserService();

  public async createInvitationForInvitees(ctx: Context) {
    const body = ctx.request.body as any;
    if (
      !body.conversationId ||
      !body.inviteeDetails ||
      !body.eventTitle ||
      !body.invitationDetails
    ) {
      ctx.throw(400, "Missing required fields");
    }
    const inviterId = (
      await this.userService.getUserBySessionToken(
        ctx.headers.authorization!.split(" ")[1]
      )
    ).id;
    const { conversationId, inviteeDetails, eventTitle, invitationDetails } =
      body;

    await Database.AppDataSource.manager.transaction(async (entityManager) => {
      const details = await this.invitationService.createInviteForAttendees(
        conversationId,
        inviterId,
        inviteeDetails,
        eventTitle,
        invitationDetails,
        entityManager
      );
      ctx.body = details;
    });
  }

  public async getInvitationsDashboard(ctx: Context) {
    const userToken = ctx.header.authorization!.split(" ")[1];
    const userId = (await this.userService.getUserBySessionToken(userToken)).id;

    const invitations = await this.invitationService.getInvitationDashboard(
      userId
    );

    ctx.body = invitations;
  }
}
export default new InvitationController();
