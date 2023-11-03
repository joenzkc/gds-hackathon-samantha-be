import { Database } from "../datasource";
import { ConfirmedMeeting } from "../entities/confirmedMeeting.entity";
import { InvitationService } from "./invitation.service";
import { RoomService } from "./room.service";

export class ConfirmationService {
  private roomService: RoomService = new RoomService();
  private invitationService: InvitationService = new InvitationService();

  public async bookRoom(
    invitationViewId: string,
    confirmStartDate: string,
    confirmedEndDate: string
  ) {
    const attendees =
      await this.invitationService.getAttendeesByInvitationViewId(
        invitationViewId
      );
    const invitationView = await this.invitationService.getInvitationViewById(
      invitationViewId
    );
    const availableRooms = await this.roomService.getAvailableRooms(
      confirmStartDate,
      confirmedEndDate,
      attendees.length + 1
    );

    if (availableRooms.length === 0) {
      throw new Error("No available rooms");
    } else {
      const roomToBook = availableRooms[0];
      await this.roomService.createRoomReservation(
        roomToBook.id,
        confirmStartDate,
        confirmedEndDate,
        invitationView.inviterId,
        attendees.map((attendee) => attendee.inviteeName)
      );
      return roomToBook;
    }
  }

  public async createConfirmation(
    invitationViewId: string,
    confirmStartDate: string,
    confirmedEndDate: string,
    roomId?: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const confirmation = new ConfirmedMeeting(
      invitationViewId,
      confirmStartDate,
      confirmedEndDate,
      roomId
    );

    const confirmedMeeting = await entityManager
      .getRepository(ConfirmedMeeting)
      .save(confirmation);

    return confirmedMeeting;
  }
}
