import Router from "koa-router";
import authController from "../controllers/auth.controller";
// import authController from "src/controllers/auth.controller";

const router = new Router();

router.get("/signin", async (ctx) => {
  // call sign in function
  // authController.signIn(ctx);
  await authController.signIn(ctx);
});

router.get("/callback", async (ctx) => {
  await authController.callback(ctx);
});

export default router.routes();
