import { ChatCompletionMessageParam } from "openai/resources";

export class ConversationMetadata {
  sender: "user" | "gpt";
  message: string;
  timestamp: Date;
  id: string;
}

export enum ConversationType {
  EMAIL = "email",
  CHAT = "chat",
}

export class GptContextMetadata {
  messages: ChatCompletionMessageParam[];
}

export enum ConversationStatus {
  ACTIVE = "Active",
  FINISHED = "Finished",
}
