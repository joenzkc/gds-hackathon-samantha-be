import Router from "koa-router";
import authRoute from "./auth.route";
import userRoute from "./user.route";
import roomRoute from "./room.route";
import openaiRoute from "./openai.route";
import invitationRoute from "./invitation.route";
import conversationRoute from "./conversation.route";
import confirmationRoute from "./confirmation.route"

const router = new Router();

router.get("/", async (ctx) => {
  console.log(ctx.session);
  if (ctx.session.userId) {
    ctx.body = "Hello World! You are logged in!";
  } else {
    ctx.body = "Hello World!";
  }
});

router.use("/auth", authRoute);
router.use("/user", userRoute);
router.use("/gpt", openaiRoute);
router.use("/room", roomRoute);
router.use("/invitation", invitationRoute);
router.use("/conversation", conversationRoute);
router.use("/confirmation", confirmationRoute)

export default router;
