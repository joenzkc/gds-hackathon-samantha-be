import { Context, Next } from "koa";
import { UserService } from "../services/user.service";

export async function checkUserExists(ctx: Context, next: Next) {
  // Get the user id from the request params
  const { authorization } = ctx.request.headers;

  // Check if the user exists
  if (!authorization || !authorization.startsWith("Bearer ")) {
    ctx.throw(401, "Invalid token");
  }

  const token = authorization.split(" ")[1];
  const user = await new UserService().doesUserExist(token);

  // If the user does not exist, throw an error
  if (!user) {
    ctx.throw(404, "User does not exist");
  }

  // If the user exists, continue with the next middleware
  await next();
}
