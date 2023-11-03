import { config } from "dotenv";
import { Context } from "koa";
import { ChatCompletionMessageParam } from "openai/resources";
import { systemPrompt } from "../gpt/gpt.functions";
import { ConversationService } from "../services/conversation.service";
import { OpenAiService } from "../services/openai.service";
import { Database } from "../datasource";

config();
class OpenAiController {
  private openAiService: OpenAiService = new OpenAiService();
  private convoService: ConversationService = new ConversationService();

  // this message initiates a conversation
  public async initialPrompt(ctx: Context) {
    const data = ctx.request.body as any;
    if (!data.message) {
      return (ctx.body = { response: "No message provided" });
    }
    const prompt = data.message;
    // definitely exists since pass through middleware
    const userToken = ctx.header.authorization!.split(" ")[1];

    // ask gpt
    let initialMessages: ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: prompt },
    ];

    // should never give an error, must be caught inside its own function and handled
    let { response, messageToSend, chatHistory, suggestedTitle } =
      await this.openAiService.functionController(
        userToken,
        initialMessages,
        prompt
      );

    // create conversation
    const convo = await this.convoService.createConversation(
      userToken,
      suggestedTitle,
      messageToSend,
      chatHistory
    );

    ctx.body = {
      title: suggestedTitle,
      response: response.choices[0].message.content,
      conversationId: convo.id,
    };
  }

  public async continueConvo(ctx: Context) {
    const data = ctx.request.body as any;
    if (!data.message) {
      return (ctx.body = { response: "No message provided" });
    }

    const userToken = ctx.header.authorization!.split(" ")[1];
    const prompt = data.message;

    const convoId = ctx.params.id;
    const convo = await this.convoService.getConversationById(convoId);
    const messagesToSend = convo.gptContextMetadata.messages;
    const existingChatHistory = convo.convoMetadata;

    messagesToSend.push({ role: "user", content: prompt });

    // ask gpt
    let { response, messageToSend, chatHistory } =
      await this.openAiService.functionController(
        userToken,
        messagesToSend,
        prompt,
        existingChatHistory,
        convoId
      );

    // update conversation
    await this.convoService.updateConversation(
      userToken,
      convoId,
      messageToSend,
      chatHistory
    );

    ctx.body = {
      response: response.choices[0].message.content,
    };
  }

  public async liaiseMeetings(ctx?: Context) {
    await this.openAiService.liaiseMeetings();
    // ctx.body = "Done";
  }

  public async replyEmail(ctx: Context) {
    const body = ctx.request.body as any;
    console.log(body);
    if (!body.convoId || !body.message || !body.email) {
      console.log(
        "Missing information",
        body.convoId,
        body.message,
        body.email
      );
      return (ctx.body = {
        response: "Missing information",
        convoId: body.convoId,
        message: body.message,
        email: body.email,
      });
    }

    const convoid = body.convoId;
    const message = body.message;
    const email = body.email;
    await Database.AppDataSource.manager.transaction(async (manager) => {
      const reply = await this.openAiService.replyEmail(
        convoid,
        message,
        email,
        manager
      );
      ctx.body = {
        called: "replyEmail",
      };
    });

    console.log("rout eend");
  }
}

export default new OpenAiController();
