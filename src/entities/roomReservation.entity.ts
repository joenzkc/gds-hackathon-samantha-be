import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  ReservationOtherData,
  ReservationStatus,
} from "../models/roomReservation.model";

@Entity()
// NOTE THERE IS NO NEEED FOR A ROOM
export class RoomReservation {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column() // USER ID
  reserveeId: string;

  @Column({ type: "timestamp with time zone" })
  startTime: Date;

  @Column({ type: "timestamp with time zone" })
  endTime: Date;

  @Column({ nullable: true }) // ROOM ID
  roomId: string;

  @Column({ type: "text" })
  status: ReservationStatus;

  @Column({ type: "jsonb" })
  otherData: ReservationOtherData;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  constructor(
    reserveeId: string,
    startTime: Date,
    endTime: Date,
    status: ReservationStatus,
    otherData?: ReservationOtherData,
    roomId?: string
  ) {
    this.reserveeId = reserveeId;
    this.startTime = startTime;
    this.endTime = endTime;
    this.status = status;
    this.otherData = otherData;
    if (roomId) {
      this.roomId = roomId;
    }
    if (otherData) {
      this.otherData = otherData;
    }
  }
}
