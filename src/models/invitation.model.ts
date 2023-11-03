export enum InvitationStatus {
  PENDING = "Pending",
  RESPONDED = "Responded",
}

export class InvitationDateDetails {
  startDate: string; // date time string, start time
  endDate: string; // date time string, end time
  status: "Yes" | "No" | "Not Responded";
}

export enum InvitationViewStatus {
  SENDING_EMAILS = "Send Emails",
  PENDING = "Pending Confirmation",
  FINISH = "Finish",
}

export class InviteeDetails {
  name: string;
  email: string;
  isVisitor: boolean;
}

export enum MeetingStatus {
  CONFIRMED = "Meeting confirmed",
  WAITING_FOR_RESPONSES = "Waiting for responses",
  NO_COMPATIBLE_DATES = "No compatible dates",
  ACTION_NEEDED = "Action needed",
}
