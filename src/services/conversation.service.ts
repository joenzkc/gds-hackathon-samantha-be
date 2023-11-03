import { ChatCompletion, ChatCompletionMessageParam } from "openai/resources";
import {
  ConversationMetadata,
  ConversationStatus,
  ConversationType,
} from "../models/conversation.model";
import { Conversation } from "../entities/conversation.entity";
import { UserService } from "./user.service";
import { Database } from "../datasource";

export class ConversationService {
  private userService: UserService = new UserService();

  public async createConversation(
    userToken: string,
    conversationTitle: string,
    messagesToSend: ChatCompletionMessageParam[],
    chatHistory: ConversationMetadata[],
    entityManager = Database.AppDataSource.manager
  ) {
    const gptContextMetadata = {
      messages: messagesToSend,
    };

    // get user id from outlook token
    const user = await this.userService.getUserBySessionToken(userToken);

    // create conversation
    const conversation = new Conversation(
      user.id,
      conversationTitle,
      chatHistory,
      gptContextMetadata
    );

    // save conversation
    return await entityManager.getRepository(Conversation).save(conversation);
  }

  public async createEmailConversation(
    email: string,
    conversationTitle: string,
    messagesToSend: ChatCompletionMessageParam[],
    chatHistory: ConversationMetadata[],
    entityManager = Database.AppDataSource.manager
  ) {
    const gptContextMetadata = {
      messages: messagesToSend,
    };

    // create conversation
    const conversation = new Conversation(
      null,
      conversationTitle,
      chatHistory,
      gptContextMetadata,
      ConversationStatus.ACTIVE,
      ConversationType.EMAIL,
      email
    );

    // save conversation
    return await entityManager.getRepository(Conversation).save(conversation);
  }

  public async updateConversationById(
    convoId: string,
    messagesToSend: ChatCompletionMessageParam[],
    chatHistory: ConversationMetadata[],
    entityManager = Database.AppDataSource.manager
  ) {
    const convo = await this.getConversationById(convoId, entityManager);

    convo.convoMetadata = chatHistory;
    convo.gptContextMetadata.messages = messagesToSend;

    return await entityManager.getRepository(Conversation).save(convo);
  }

  public async updateConversation(
    userToken: string,
    convoId: string,
    messagesToSend: ChatCompletionMessageParam[],
    chatHistory: ConversationMetadata[],
    entityManager = Database.AppDataSource.manager
  ) {
    const convo = await this.getConversationById(convoId, entityManager);

    // check if user is the owner of the conversation
    const user = await this.userService.getUserBySessionToken(userToken);
    if (convo.userId !== user.id) {
      throw new Error("User is not the owner of the conversation");
    }

    convo.convoMetadata = chatHistory;
    convo.gptContextMetadata.messages = messagesToSend;

    return await entityManager.getRepository(Conversation).save(convo);
  }

  public async getUsersConversations(
    userId: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const convoRepo = entityManager.getRepository(Conversation);
    const conversations = await convoRepo.find({
      where: {
        userId,
      },
      order: {
        updatedAt: "DESC",
      },
    });

    return conversations;
  }

  public async getConversationById(
    convoId: string,
    entityManager = Database.AppDataSource.manager
  ) {
    if (!convoId) {
      throw new Error("No conversation id provided");
    }
    const convo = await entityManager
      .getRepository(Conversation)
      .findOneOrFail({
        where: {
          id: convoId,
        },
      });

    return convo;
  }
}
