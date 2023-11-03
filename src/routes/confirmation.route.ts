import Router from "koa-router";
import confirmationController from "../controllers/confirmation.controller";
import { checkUserExists } from "../middleware/checkUser.middleware";

const router = new Router();

router.post("/book-room", checkUserExists, async (ctx) => {
  await confirmationController.bookRoom(ctx);
});

router.post("/create-confirmation", checkUserExists, async (ctx) => {
    await confirmationController.createConfirmation(ctx);
});

export default router.routes();
