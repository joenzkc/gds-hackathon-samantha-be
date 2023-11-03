import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import {
  InvitationDateDetails,
  InvitationStatus,
} from "../models/invitation.model";

@Entity()
@Unique(["invitationViewId", "inviteeEmail", "inviteeName"])
export class Invitation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  inviteeName: string;

  @Column({ nullable: false })
  inviteeEmail: string;

  @Column({ nullable: false }) // MUST BE USER ID
  inviterId: string;

  @Column({ type: "text", nullable: false })
  status: InvitationStatus; // liaising = await responses, when 1 responds, pending, all respond = finish

  @Column()
  invitationViewId: string;

  @Column({ type: "jsonb", nullable: false })
  invitationDetails: InvitationDateDetails[];

  @Column({ type: "boolean", default: false })
  isVisitor: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    inviteeName: string,
    inviteeEmail: string,
    inviterId: string,
    status: InvitationStatus,
    invitationDetails: InvitationDateDetails[],
    invitationViewId: string,
    isVisitor: boolean
  ) {
    this.inviteeName = inviteeName;
    this.inviteeEmail = inviteeEmail;
    this.inviterId = inviterId;
    this.status = status;
    this.invitationDetails = invitationDetails;
    this.invitationViewId = invitationViewId;
    this.isVisitor = isVisitor;
  }
}
