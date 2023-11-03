import Router from "koa-router";
import userController from "../controllers/user.controller";

const router = new Router();

router.get("/userDetails", async (ctx) => {
  await userController.getUserDetails(ctx);
});

router.get("/schedule", async (ctx) => {
  await userController.getUsersSchedule(ctx);
});

export default router.routes();
