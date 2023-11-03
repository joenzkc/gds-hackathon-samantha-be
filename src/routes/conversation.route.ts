import Router from "koa-router";
import conversationController from "../controllers/conversation.controller";
import { checkUserExists } from "../middleware/checkUser.middleware";

const router = new Router();

router.get("/get-convos", checkUserExists, async (ctx) => {
  await conversationController.getUsersConversations(ctx);
});

router.get("/get-convo-ids", checkUserExists, async (ctx) => {
  await conversationController.getUsersConversationIds(ctx);
});

router.get("/get-convo", checkUserExists, async (ctx) => {
  await conversationController.getConversation(ctx);
});

router.get("/get-email-convo", async (ctx) => {
  await conversationController.getEmailConversation(ctx);
  console.log(ctx);
});

export default router.routes();
