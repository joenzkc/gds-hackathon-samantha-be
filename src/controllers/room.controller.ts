import { Context } from "koa";
import { RoomService } from "../services/room.service";

class RoomController {
  private roomService = new RoomService();
  public async createRoom(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.roomName || !body.roomCapacity) {
      throw new Error("Invalid request body");
    }
    const { roomName, roomCapacity } = body;

    const room = await this.roomService.createRoom(roomName, roomCapacity);
    ctx.body = room;
  }

  public async createRoomReservation(ctx: Context) {
    const body = ctx.request.body as any;
    if (
      !body.startDate ||
      !body.endDate ||
      !body.reserveeId ||
      !body.roomId ||
      !body.attendees
    ) {
      throw new Error("Invalid request body");
    }
    const { startDate, endDate, reserveeId, roomId, attendees } = body;
    const meeting = await this.roomService.createRoomReservation(
      roomId,
      startDate,
      endDate,
      reserveeId,
      attendees
    );
    ctx.body = meeting;
  }

  public async createMeetingReservationWithNoRoom(ctx: Context) {
    const body = ctx.request.body as any;
    if (
      !body.startDate ||
      !body.endDate ||
      !body.reserveeId ||
      !body.attendees
    ) {
      throw new Error("Invalid request body");
    }
    const { startDate, endDate, reserveeId, attendees } = body;
    const meeting = await this.roomService.createMeetingReservationWithNoRoom(
      startDate,
      endDate,
      reserveeId,
      attendees
    );
    ctx.body = meeting;
  }

  public async checkRoomAvailability(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.startDate || !body.endDate || !body.roomId) {
      throw new Error("Invalid request body");
    }
    const { startDate, endDate, roomId } = body;
    const isRoomAvailable = await this.roomService.isRoomAvailable(
      startDate,
      endDate,
      roomId
    );

    ctx.body = { isRoomAvailable };
  }

  public async getAvailableRooms(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.startDate || !body.endDate) {
      throw new Error("Invalid request body");
    }

    const { startDate, endDate } = body;
    const availableRooms = await this.roomService.getAvailableRooms(
      startDate,
      endDate
    );
    ctx.body = { availableRooms };
  }

  public async getClosestRoomName(ctx: Context) {
    const body = ctx.request.body as any;
    if (!body.roomName) {
      throw new Error("Invalid request body");
    }

    const { roomName } = body;
    const closestRoomName = await this.roomService.getClosestRoomName(roomName);
    ctx.body = { closestRoomName };
  }
}

export default new RoomController();
