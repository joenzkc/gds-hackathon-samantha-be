import Router from "koa-router";
import openaiController from "../controllers/openai.controller";
import { checkUserExists } from "../middleware/checkUser.middleware";

const router = new Router();

router.post("/", checkUserExists, async (ctx) => {
  await openaiController.initialPrompt(ctx);
});

router.post("/:id", checkUserExists, async (ctx) => {
  await openaiController.continueConvo(ctx);
});

router.get("/liaise", async (ctx) => {
  await openaiController.liaiseMeetings(ctx);
});

router.post("/email/reply-email", async (ctx) => {
  await openaiController.replyEmail(ctx);
});

export default router.routes();
