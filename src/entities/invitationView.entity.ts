import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { InvitationViewStatus } from "../models/invitation.model";

@Entity()
export class InvitationView {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  inviterId: string;

  @Column({ nullable: false, unique: true }) // only 1 conversation per invitation view
  conversationId: string;

  @Column({ nullable: false })
  expectedResponses: number;

  @Column({ nullable: false })
  currentResponses: number;

  @Column({ nullable: false })
  eventTitle: string;

  @Column({ nullable: false, type: "text" })
  invitationViewStatus: InvitationViewStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    inviterId: string,
    conversationId: string,
    expectedResponses: number,
    currentResponses: number,
    eventTitle: string,
    invitationViewStatus: InvitationViewStatus
  ) {
    this.inviterId = inviterId;
    this.conversationId = conversationId;
    this.expectedResponses = expectedResponses;
    this.currentResponses = currentResponses;
    this.eventTitle = eventTitle;
    this.invitationViewStatus = invitationViewStatus;
  }
}
