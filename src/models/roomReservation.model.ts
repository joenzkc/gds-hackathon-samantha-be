export enum ReservationStatus {
  RESERVED = "Reserved",
  CANCELLED = "Cancelled",
}

export class ReservationOtherData {
  attendees?: string[];
}
