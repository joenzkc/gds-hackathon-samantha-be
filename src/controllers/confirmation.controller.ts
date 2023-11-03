import { Context } from "koa";
import { ConfirmationService } from "../services/confirmation.service";
import { InvitationService } from "../services/invitation.service";
import { InvitationViewStatus } from "../models/invitation.model";
import { Database } from "../datasource";
import { RoomService } from "../services/room.service";
import { ConfirmedMeeting } from "../entities/confirmedMeeting.entity";

class ConfirmationController {
  private confirmationService: ConfirmationService = new ConfirmationService();
  private invitationService: InvitationService = new InvitationService();
  private roomService: RoomService = new RoomService();

  public async bookRoom(ctx: Context) {
    const body = ctx.request.body as any;
    if (
      !body.invitationViewId ||
      !body.confirmedStartDate ||
      !body.confirmedEndDate
    ) {
      ctx.throw(400, "Missing required fields");
    }

    const { invitationViewId, confirmedStartDate, confirmedEndDate } = body;
    const bookedRoom = await this.confirmationService.bookRoom(
      invitationViewId,
      confirmedStartDate,
      confirmedEndDate
    );

    ctx.body = {
      bookedRoom: bookedRoom.roomName,
      id: bookedRoom.id,
    };
  }

  public async createConfirmation(ctx: Context) {
    const body = ctx.request.body as any;
    if (
      !body.invitationViewId ||
      !body.confirmedStartDate ||
      !body.confirmedEndDate
    ) {
      ctx.throw(400, "Missing required fields");
    }

    await Database.AppDataSource.manager.transaction(async (manager) => {
      let result: ConfirmedMeeting;
      const invitationView = await this.invitationService.getInvitationViewById(
        body.invitationViewId,
        manager
      );
      if (body.room) {
        // check for available room first
        const availableRoom = await this.roomService.getAvailableRooms(
          body.confirmedStartDate,
          body.confirmedEndDate,
          invitationView.expectedResponses,
          manager
        );

        if (availableRoom.length === 0) {
          ctx.throw(400, "No available rooms");
          return;
        }

        const attendees =
          await this.invitationService.getAttendeesByInvitationViewId(
            body.invitationViewId,
            manager
          );

        // book room
        const bookedRoom = await this.roomService.createRoomReservation(
          availableRoom[0].id,
          body.confirmedStartDate,
          body.confirmedEndDate,
          invitationView.inviterId,
          attendees.map((invitee) => invitee.inviteeName),
          manager
        );

        result = await this.confirmationService.createConfirmation(
          body.invitationViewId,
          body.confirmedStartDate,
          body.confirmedEndDate,
          availableRoom[0].id,
          manager
        );

        ctx.body = {
          message: "Successfully created confirmation",
          confirmedDate: result.confirmStartDate,
          id: result,
          bookedRoom: availableRoom[0].roomName,
        };
      } else {
        result = await this.confirmationService.createConfirmation(
          body.invitationViewId,
          body.confirmedStartDate,
          body.confirmedEndDate,
          null,
          manager
        );

        ctx.body = {
          message: "Successfully created confirmation",
          confirmedDate: result.confirmStartDate,
          id: result,
        };
      }

      // change invitation view status to confirmed
      await this.invitationService.updateInvitationViewStatus(
        body.invitationViewId,
        InvitationViewStatus.FINISH,
        manager
      );
    });
  }

  public async test() {
    console.log("test");
  }
}

export default new ConfirmationController();
