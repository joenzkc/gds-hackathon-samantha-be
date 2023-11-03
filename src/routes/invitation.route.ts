import Router from "koa-router";
import invitationController from "../controllers/invitation.controller";
import { checkUserExists } from "../middleware/checkUser.middleware";

const router = new Router();

router.post("/create-invitation", checkUserExists, async (ctx) => {
  await invitationController.createInvitationForInvitees(ctx);
});

router.get("/invitation-dashboard", checkUserExists, async (ctx) => {
  await invitationController.getInvitationsDashboard(ctx);
});

export default router.routes();
