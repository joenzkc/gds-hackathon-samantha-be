import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ConfirmedMeeting {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  invitationViewId: string;

  @Column({ nullable: true })
  roomId: string;

  @Column({ nullable: false })
  confirmStartDate: string;

  @Column({ nullable: false })
  confirmedEndDate: string;

  constructor(
    invitationViewId: string,
    confirmStartDate: string,
    confirmedEndDate: string,
    roomId?: string,
  ) {
    this.invitationViewId = invitationViewId;
    this.roomId = roomId ? roomId : null;
    this.confirmStartDate = confirmStartDate;
    this.confirmedEndDate = confirmedEndDate;
  }
}
