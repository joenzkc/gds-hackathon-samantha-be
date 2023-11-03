import moment from "moment-timezone";
import { Database } from "../datasource";
import { Room } from "../entities/room.entity";
import { RoomReservation } from "../entities/roomReservation.entity";
import { ReservationStatus } from "../models/roomReservation.model";
import Fuse from "fuse.js";
import { EntityManager } from "typeorm";
import { companyDetails } from '../gpt/gpt.functions';

export class RoomService {
  public async createRoom(roomName: string, roomCapacity: number) {
    // ...
    const roomRepo = Database.AppDataSource.getRepository(Room);
    const room = await roomRepo.save({ roomName, roomCapacity });
    return room;
  }

  public async createMeetingReservationWithNoRoom(
    startTime: string,
    endTime: string,
    reserveeId: string,
    attendees: string[],
    entityManager = Database.AppDataSource.manager
  ) {
    const roomReservationRepo = entityManager.getRepository(RoomReservation);
    const startTimeDate = moment(startTime).utc().toDate();
    const endTimeDate = moment(endTime).utc().subtract(1, "second").toDate();

    // create room reservation
    const roomReservation = new RoomReservation(
      reserveeId,
      startTimeDate,
      endTimeDate,
      ReservationStatus.RESERVED,
      { attendees }
    );

    const roomReservationSaved = await roomReservationRepo.save(
      roomReservation
    );
    return roomReservationSaved;
  }

  public async createRoomReservation(
    roomId: string,
    startTime: string,
    endTime: string,
    reserveeId: string,
    attendees: string[],
    entityManager = Database.AppDataSource.manager
  ) {
    const roomReservationRepo = entityManager.getRepository(RoomReservation);
    const startTimeDate = moment(startTime).utc().toDate();
    const endTimeDate = moment(endTime).utc().subtract(1, "s").toDate();

    // check if room is available
    const isRoomAvailable = await this.isRoomAvailable(
      startTimeDate.toUTCString(),
      endTimeDate.toUTCString(),
      roomId
    );
    if (!isRoomAvailable) {
      throw new Error("Room is not available");
    }

    // create room reservation
    const roomReservation = new RoomReservation(
      reserveeId,
      startTimeDate,
      endTimeDate,
      ReservationStatus.RESERVED,
      { attendees },
      roomId
    );

    const roomReservationSaved = await roomReservationRepo.save(
      roomReservation
    );
    return roomReservationSaved;
  }

  public async isRoomNameAvailable(
    roomName: string,
    startDate: string,
    endDate: string
  ) {
    const closestRoomName = await this.getClosestRoomName(roomName);
    const availableRooms = await this.getAvailableRooms(startDate, endDate);
    console.log("available rooms:", availableRooms);
    const availableRoomNames = availableRooms.map((room) => room.roomName);
    if (availableRoomNames.includes(closestRoomName)) {
      return true;
    }
    return false;
  }

  public async getRoomReservations(
    roomId: string,
    entityManager = Database.AppDataSource.manager,
    startTime?: string,
    endTime?: string,
    capacity?: number
  ) {
    let queryBuilder = entityManager
      .getRepository(RoomReservation)
      .createQueryBuilder("roomReservation")
      .where("roomReservation.roomId = :roomId", { roomId });

    if (startTime && endTime) {
      const startTimeMoment = moment
        .tz(startTime, "Asia/Singapore")
        .format("YYYY-MM-DD HH:mm:ssZ");
      const endTimeMoment = moment
        .tz(endTime, "Asia/Singapore")
        .format("YYYY-MM-DD HH:mm:ssZ");

      console.log(startTimeMoment);
      console.log(endTimeMoment);

      if (capacity) {
        queryBuilder = queryBuilder.andWhere(
          "(roomReservation.startTime BETWEEN :startTime AND :endTime OR roomReservation.endTime BETWEEN :startTime AND :endTime)",
          { startTime: startTimeMoment, endTime: endTimeMoment }
        ).andWhere("roomReservation.capacity >= :capacity", { capacity });
      } else {
        queryBuilder = queryBuilder.andWhere(
          "(roomReservation.startTime BETWEEN :startTime AND :endTime OR roomReservation.endTime BETWEEN :startTime AND :endTime)",
          { startTime: startTimeMoment, endTime: endTimeMoment }
        );
      }
      return await queryBuilder.getMany();
    } else {
      if (capacity) {
        queryBuilder = queryBuilder.andWhere("roomReservation.capacity >= :capacity", { capacity });
        return await queryBuilder.getMany();
      }
    }

  }

  public async isRoomAvailable(
    startTime: string,
    endTime: string,
    roomId: string,
    capacity?: number,
    entityManager = Database.AppDataSource.manager
  ) {
    console.log(startTime);
    console.log(endTime);
    const reservations = await this.getRoomReservations(
      roomId,
      entityManager,
      startTime,
      endTime,
      capacity
    );
    if (reservations.length > 0) {
      return false;
    }
    return true;
  }

  public async getAvailableRooms(
    startDate: string,
    endDate: string,
    capacity?: number,
    entityManager = Database.AppDataSource.manager
  ) {
    const startTimeMoment = moment
      .tz(startDate, "Asia/Singapore")
      .format("YYYY-MM-DD HH:mm:ssZ");
    const endTimeMoment = moment
      .tz(endDate, "Asia/Singapore")
      .format("YYYY-MM-DD HH:mm:ssZ");

    const allRooms = await entityManager.getRepository(Room).find();
    const availRooms = [];
    // very jank... i know... change it TODO:
    for (const room of allRooms) {
      const isRoomAvailable = await this.isRoomAvailable(
        startTimeMoment,
        endTimeMoment,
        room.id
      );
      if (isRoomAvailable) {
        availRooms.push(room);
      }
    }

    return availRooms;
  }

  public async getClosestRoomName(roomName: string) {
    const roomRepo = Database.AppDataSource.getRepository(Room);
    const rooms = await roomRepo.find();

    const fuse = new Fuse(rooms, {
      keys: ["roomName"],
      threshold: 0.2,
      minMatchCharLength: 3,
    });
    const results = fuse.search(roomName);
    if (results.length === 0) {
      throw new Error("No room found");
    }
    const closestRoomName = results[0].item;
    return closestRoomName;
  }
}
