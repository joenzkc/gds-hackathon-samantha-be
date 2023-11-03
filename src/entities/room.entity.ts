import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Room {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  roomName: string;

  @Column()
  roomCapacity: number;

  @Column({ type: "jsonb", nullable: true })
  otherAttributes: any;
}
