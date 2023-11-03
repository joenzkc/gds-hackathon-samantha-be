import { Context } from "koa";
import { ConversationService } from "../services/conversation.service";
import { UserService } from "../services/user.service";

class ConversationController {
  private convoService: ConversationService = new ConversationService();
  private userService: UserService = new UserService();
  public async getUsersConversations(ctx: Context) {
    const userToken = ctx.header.authorization!.split(" ")[1];
    const userId = (await this.userService.getUserBySessionToken(userToken)).id;

    const conversations = await this.convoService.getUsersConversations(userId);

    ctx.body = conversations;
  }

  public async test() {
    console.log("test");
  }

  public async getUsersConversationIds(ctx: Context) {
    const userToken = ctx.header.authorization!.split(" ")[1];
    const userId = (await this.userService.getUserBySessionToken(userToken)).id;

    const conversations = await this.convoService.getUsersConversations(userId);

    const convoIds = conversations.map((convo) => {
      return {
        id: convo.id,
        title: convo.conversationTitle,
        updatedAt: convo.updatedAt,
      };
    });

    ctx.body = convoIds;
  }

  public async getConversation(ctx: Context) {
    const convoId = ctx.request.query.convoId as string;
    if (!convoId) {
      return (ctx.body = { response: "No conversation id provided" });
    }

    const convo = await this.convoService.getConversationById(convoId);
    ctx.body = convo.convoMetadata;
  }

  public async getEmailConversation(ctx: Context) {
    const convoId = ctx.request.query.convoId as string;
    if (!convoId) {
      throw new Error("No conversation id provided");
    }
    console.log("convoId", convoId);
    const convo = await this.convoService.getConversationById(convoId);
    console.log("convo", convo);
    ctx.body = convo;
  }
}

export default new ConversationController();
