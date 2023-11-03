import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  ConversationMetadata,
  ConversationStatus,
  ConversationType,
  GptContextMetadata,
} from "../models/conversation.model";

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true }) // NO FKEYS! NO TIME
  userId: string;

  @Column({ nullable: true, default: null })
  userEmail: string;

  @Column({ type: "text", default: "chat" })
  conversationType: ConversationType;

  @Column()
  conversationTitle: string;

  @Column({ type: "jsonb", default: {} })
  convoMetadata: ConversationMetadata[];

  @Column({ type: "jsonb", default: {} })
  gptContextMetadata: GptContextMetadata;

  @Column({ type: "text" })
  status: ConversationStatus;

  @Column({ type: "text", nullable: true }) // for emails
  parentConversation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    userId: string,
    conversationTitle: string,
    convoMetadata: ConversationMetadata[],
    gptContextMetadata: GptContextMetadata,
    status = ConversationStatus.ACTIVE,
    conversationType = ConversationType.CHAT,
    email?: string,
    parentConversationId?: string
  ) {
    this.userId = userId;
    this.conversationTitle = conversationTitle;
    this.convoMetadata = convoMetadata;
    this.gptContextMetadata = gptContextMetadata;
    this.status = status;
    this.conversationType = conversationType;
    this.userEmail = email ? email : null;
    this.parentConversation = parentConversationId;
  }
}
