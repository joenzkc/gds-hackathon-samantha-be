import { Context } from "koa";
import { msalClient } from "../msalClient";
import { AuthorizationCodeRequest } from "@azure/msal-node";
import Graph from "../graph";
import { UserService } from "../services/user.service";
import { User } from "../entities/user.entity";
import { AuthService } from "../services/auth.service";

class AuthController {
  private userService = new UserService();
  private authService = new AuthService();

  async signIn(ctx: Context) {
    if (ctx.request.query.outlookToken) {
      const user = await this.userService.getUserBySessionToken(
        ctx.request.query.outlookToken as string
      );

      if (!user) {
        ctx.body = "Invalid session token";
        return;
      }
      ctx.body = "Hello World! You are logged in!";
    }

    const authUrl = await this.authService.signIn();
    ctx.body = { authUrl: authUrl };
  }

  // just leave callback logic in the controller, laze
  async callback(ctx: Context) {
    const scopes =
      process.env.OAUTH_SCOPES || "https://graph.microsoft.com/.default";
    const tokenRequest: AuthorizationCodeRequest = {
      code: ctx.request.query.code as string,
      scopes: scopes.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };

    try {
      const response = await msalClient.msalClient.acquireTokenByCode(
        tokenRequest
      );

      // Save the user's homeAccountId in their session
      const userId = response.account.homeAccountId;
      ctx.session.userId = userId;

      const doesUserExist = await this.userService.doesUserExist(userId);
      if (!doesUserExist) {
        const userDetails = await Graph.getUserDetails(userId);
        const user: User = new User(
          userId,
          userDetails.displayName,
          userDetails.mail || userDetails.userPrincipalName,
          userDetails.mailboxSettings.timeZone
        );

        await this.userService.createUser(user);
      }

      //TODO: redirect to the frontend signed in page
      ctx.redirect("/");
    } catch (error) {
      console.log(error);
    }
  }
}

export default new AuthController();
