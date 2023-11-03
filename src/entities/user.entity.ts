import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
  constructor(
    outlookToken: string,
    displayName: string,
    outlookEmail: string,
    timezone?: string
  ) {
    this.outlookToken = outlookToken;
    this.displayName = displayName;
    this.outlookEmail = outlookEmail;
    this.timezone = timezone || "Asia/Singapore";
  }

  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ nullable: true })
  outlookToken: string;

  @Column()
  displayName: string;

  @Column()
  outlookEmail: string;

  @Column({ default: "Asia/Singapore" })
  timezone: string;
}
