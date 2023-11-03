import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Visitor {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false })
  email: string;

  @Column() // MUST BE A CONVO ID
  conversationId: string;

  @Column({ type: "date", nullable: false })
  visitDateAndTime: Date;

  @Column({ nullable: false })
  inviterId: string;
}
