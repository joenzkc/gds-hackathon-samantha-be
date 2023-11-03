import { EntityManager, Repository } from "typeorm";
import { Database } from "../datasource";
import { Conversation } from "../entities/conversation.entity";
import { Invitation } from "../entities/invitation.entity";
import { InvitationView } from "../entities/invitationView.entity";
import {
  InvitationDateDetails,
  InvitationStatus,
  InvitationViewStatus,
  InviteeDetails,
  MeetingStatus,
} from "../models/invitation.model";
import { ConfirmedMeeting } from "../entities/confirmedMeeting.entity";

export class InvitationService {
  public async createInvitation(
    inviterId: string,
    inviteeDetails: InviteeDetails,
    invitationViewId: string,
    invitationDetails: InvitationDateDetails[],
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationRepo = entityManager.getRepository(Invitation);
    const invitation = new Invitation(
      inviteeDetails.name,
      inviteeDetails.email,
      inviterId,
      InvitationStatus.PENDING,
      invitationDetails,
      invitationViewId,
      inviteeDetails.isVisitor
    );

    return await invitationRepo.save(invitation);
  }

  // for changing a single invitation's status
  public async updateInvitationStatus(
    conversationId: string,
    inviteeEmail: string,
    status: InvitationStatus,
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo = entityManager.getRepository(InvitationView);
    const invitationView = await invitationViewRepo.findOneByOrFail({
      id: conversationId,
    });

    const invitationRepo = entityManager.getRepository(Invitation);
    const invitation = await invitationRepo.findOneByOrFail({
      inviteeEmail,
      invitationViewId: invitationView.id,
    });

    invitation.status = status;
    return await invitationRepo.save(invitation);
  }

  public async createInvitationView(
    conversationId: string,
    inviterId: string,
    inviteeDetails: InviteeDetails[],
    eventTitle: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const expectedResponses = inviteeDetails.length;
    const currentResponses = 0;
    const invitationViewStatus = InvitationViewStatus.SENDING_EMAILS;

    const invitationViewObject = new InvitationView(
      inviterId,
      conversationId,
      expectedResponses,
      currentResponses,
      eventTitle,
      invitationViewStatus
    );

    const invitationViewRepo = entityManager.getRepository(InvitationView);
    return await invitationViewRepo.save(invitationViewObject);
  }

  public async getInvitationViewById(
    id: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo = entityManager.getRepository(InvitationView);
    return await invitationViewRepo.findOneByOrFail({ id });
  }

  public async getAttendeesByInvitationViewId(
    id: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationRepo = entityManager.getRepository(Invitation);
    return await invitationRepo.findBy({ invitationViewId: id });
  }

  public async createInviteForAttendees(
    conversationId: string,
    inviterId: string,
    inviteeDetails: InviteeDetails[],
    eventTitle: string,
    invitationDetails: InvitationDateDetails[],
    entityManager = Database.AppDataSource.manager
  ) {
    console.log("Inside createInviteForAttendees");
    const invitationView = await this.createInvitationView(
      conversationId,
      inviterId,
      inviteeDetails,
      eventTitle,
      entityManager
    );

    console.log("view created");
    const invitations = [];

    for (const invitee of inviteeDetails) {
      const invitation = await this.createInvitation(
        inviterId,
        invitee,
        invitationView.id,
        invitationDetails,
        entityManager
      );
      invitations.push(invitation);
    }

    return { invitationView, invitations };
  }

  public async updateInvitationViewStatus(
    invitationViewId: string,
    status: InvitationViewStatus,
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo = entityManager.getRepository(InvitationView);
    const invitationView = await invitationViewRepo.findOneByOrFail({
      id: invitationViewId,
    });

    invitationView.invitationViewStatus = status;
    await invitationViewRepo.save(invitationView);
  }

  public async getInvitationViewByConvoId(
    convoId: string,
    entityManager: EntityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo =
      entityManager.getRepository<InvitationView>(InvitationView);
    const invitationView = await invitationViewRepo.findOneByOrFail({
      conversationId: convoId,
    });

    return invitationView;
  }

  public async getInvitationByEmailAndViewId(
    invitationViewId: string,
    email: string,
    entityManager: EntityManager = Database.AppDataSource.manager
  ) {
    const invitationRepo = entityManager.getRepository<Invitation>(Invitation);
    const invitation = await invitationRepo.findOneOrFail({
      where: {
        inviteeEmail: email,
        invitationViewId,
      },
    });

    return invitation;
  }

  public async updateInvitationDateDetails(
    invitationId: string,
    dateDetails: InvitationDateDetails[],
    entityManager: EntityManager = Database.AppDataSource.manager
  ) {
    const invitationRepo = entityManager.getRepository<Invitation>(Invitation);
    const invitation = await invitationRepo.findOne({
      where: {
        id: invitationId,
      },
    });

    invitation.invitationDetails = dateDetails;
    invitation.status = InvitationStatus.RESPONDED;

    return await entityManager.save(invitation);
  }

  public async respondToInvitation(
    email: string,
    conversationId: string,
    updatedDates: InvitationDateDetails[],
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo: Repository<InvitationView> =
      entityManager.getRepository(InvitationView);
    const invitationView = await invitationViewRepo.findOneByOrFail({
      conversationId: conversationId,
    });

    const invitationRepo: Repository<Invitation> =
      entityManager.getRepository(Invitation);

    const invitation = await invitationRepo.findOneByOrFail({
      inviteeEmail: email,
      invitationViewId: invitationView.id,
    });

    invitation.status = InvitationStatus.RESPONDED;

    invitation.invitationDetails = updatedDates;
    await invitationRepo.save(invitation);
  }

  public async getInvitationDashboard(
    userId: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const invitationViewRepo = entityManager.getRepository(InvitationView);

    const invitationViews = await invitationViewRepo.find({
      where: {
        inviterId: userId,
      },
      order: {
        updatedAt: "DESC",
      },
    });

    const invitationRepo = entityManager.getRepository(Invitation);
    const invitationViewObjects = [];
    for (const invitationView of invitationViews) {
      const invitations = await invitationRepo.find({
        where: {
          invitationViewId: invitationView.id,
        },
        order: {
          updatedAt: "ASC",
        },
      });

      let invitationViewObject = {};
      let meetingStatus = MeetingStatus.WAITING_FOR_RESPONSES;
      invitationViewObject[invitationView.id] = {
        meetingTitle: invitationView.eventTitle,
        meetingStatus: meetingStatus,
        samProgress: invitationView.invitationViewStatus,
        attendees: [],
      };
      const attendees = [];
      let numOfResponses = 0;
      const arrayOfDates: InvitationDateDetails[][] = [];
      let numOfDates = 0;
      let numOfCompatibleDates = 0;

      for (const invitation of invitations) {
        const attendee = {
          name: invitation.inviteeName,
          email: invitation.inviteeEmail,
          role: invitation.isVisitor ? "Visitor" : "Internal",
          roleInformation: invitation.isVisitor ? "Pending Registration" : "",
          attendeeStatus: "Pending",
          dateResponse: invitation.invitationDetails,
        };

        const dates = invitation.invitationDetails;
        let unavailable = false;
        let responded = false;
        for (const date of dates) {
          if (date.status === "Yes") {
            responded = true;
          } else if (date.status === "No") {
            unavailable = true;
          }
        }
        arrayOfDates.push(dates);
        numOfDates = dates.length;

        if (responded) {
          numOfResponses++;
          attendee.attendeeStatus = "Responded";
        } else if (unavailable) {
          numOfResponses++;
          attendee.attendeeStatus = "Unavailable";
        }
        attendees.push(attendee);
      }

      if (numOfResponses === invitations.length) {
        // check through all the dates. if there is no compatible date, then set meetingStatus to NO_COMPATIBLE_DATES

        if (
          arrayOfDates.every(
            (dateArray) => dateArray.length === arrayOfDates[0].length
          )
        ) {
          let allYes = true;

          for (let i = 0; i < arrayOfDates[0].length; i++) {
            allYes = true;

            arrayOfDates.forEach((dateArray) => {
              if (dateArray[i].status !== "Yes") {
                allYes = false;
              }
            });

            if (allYes) {
              numOfCompatibleDates++;
            }
          }

          invitationViewObject[invitationView.id]["meetingStatus"] =
            numOfCompatibleDates === 0
              ? MeetingStatus.NO_COMPATIBLE_DATES
              : MeetingStatus.ACTION_NEEDED;
        }
      }

      if (invitationView.invitationViewStatus === InvitationViewStatus.FINISH) {
        invitationViewObject[invitationView.id]["meetingStatus"] =
          MeetingStatus.CONFIRMED;

        console.log(invitationView.id);

        // get the confirmed meeting date
        const confirmationRepo = entityManager.getRepository(ConfirmedMeeting);
        const confirmation = await confirmationRepo.findOneByOrFail({
          invitationViewId: invitationView.id,
        });

        invitationViewObject[invitationView.id]["confirmedDate"] =
          confirmation.confirmStartDate;
      }

      invitationViewObject[invitationView.id]["numOfCompatibleDates"] =
        numOfCompatibleDates;
      invitationViewObject[invitationView.id]["numOfDates"] = numOfDates;

      invitationViewObject[invitationView.id]["attendees"] = attendees;
      invitationViewObjects.push(invitationViewObject);
    }
    return invitationViewObjects;
  }
}
