import { config } from "dotenv";
import Koa from "koa";
import cors from "@koa/cors";
import { Database } from "./datasource";
import router from "./routes";
import session from "koa-session";
import bodyParser from "koa-bodyparser";
import { errorHandler } from "./middleware/errorHandler.middleware";
import * as cron from "node-cron";
import conversationController from "./controllers/conversation.controller";
import openaiController from "./controllers/openai.controller";
import AWS from "aws-sdk";

config();

const app = new Koa();

// only use cors for testing locally
// if (process.env.NODE_ENV === "local") {
app.use(cors());
// }

class Server {
  public async setupServer() {
    await Database.setupDb();
    app.keys = [process.env.SESSION_KEY || "secret"];
    app.use(session(app));
    app.use(bodyParser());
    app.use(errorHandler);

    app.use(router.routes()).use(router.allowedMethods());
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: "ap-southeast-1",
    });

    // cron job to batch liaise...
    cron.schedule("* * * * *", () => {
      console.log("checking for emails to send");
      openaiController.liaiseMeetings();
    });
    app.listen(process.env.PORT || 3000);

    // app.use(flash());
    console.log(`Server started on port ${process.env.PORT || 3000}`);
  }
}

try {
  new Server().setupServer();
} catch (error) {
  console.log(error);
}
