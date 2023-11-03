import moment from "moment";
import { ChatCompletionCreateParams } from "openai/resources";

export const functions: ChatCompletionCreateParams.Function[] = [
  // {
  //   name: "getUserGraphDetailsByEmail",
  //   description: "Get user details by email",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       userEmail: {
  //         type: "string",
  //         description: "Email of the user",
  //       },
  //     },
  //     required: ["userEmail"],
  //   },
  // },
  {
    name: "createInvite",
    description: `Create an invite for an event titled {eventTitle} with participants {participantDetails} and potential timeslots {timeslots}.
      Require: eventTitle, participantDetails, timeslots
      participants = name, email, staff/visitor status. All participants must have an email address
      eventTitle: name of the meeting invitation. This is required, ask user for the name of the meeting if not provided.
      timeslots = start datetime, end datetime in ISO format. there is also a status field which is defaulted to 'Not Responded'.
      Format timeslots to DD MMM YYYY in reply.
      Prompt if any required information missing, ESPECIALLY THE EMAIL ADDRESS. The email of the participant is required, DO NOT ASSUME THE EMAIL OF THE PARTICIPANT.
      Return: invite with formatted timeslots.
      If isConfirmed is false, ask the user to confirm the meeting. If yes, then true, else false.
      This function should not be called recursively. User should need to confirm between the calls of this function`,
    parameters: {
      type: "object",
      properties: {
        eventTitle: {
          type: "string",
          description: "Meeting agenda, or meeting topic",
        },
        participants: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: {
                type: "string",
                description:
                  "Name of the participant, respect the person's name by captialising the first letter of each word",
              },
              email: {
                type: "string",
                description: "Email address of the participant",
              },
              isVisitor: {
                type: "boolean",
                description: "Default is false unless specified",
              },
            },
          },
          description: "Participants of the event",
        },
        timeslots: {
          type: "array",
          items: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                description: "Start time of the meeting in ISO date string",
              },
              endDate: {
                type: "string",
                description: "End time of the meeting in ISO date string",
              },
              status: {
                type: "string",
                description: "The status is 'Not Responded' by default",
              },
            },
          },
          description: "Potential meeting timeslots",
        },
        isConfirmed: {
          type: "boolean",
          description: `Defaulted to false unless YOU have confirmed with the user, and that the user has mentioned "YES". If Yes, then true, else false`,
        },
      },
      required: ["eventTitle", "participants", "timeslots", "isConfirmed"],
    },
  },
  {
    name: "getRoomsAvailability",
    description:
      "Given a room name, start (REQUIRED) and end time (REQUIRED), check if the room name is available. IF NO START TIME OR END TIME ARE PROVIDED, PROMPT THE USER FOR A START AND END TIME. If a user is creating an invite, this function is not needed",
    parameters: {
      type: "object",
      properties: {
        roomName: {
          type: "string",
          description: "Name of the room",
        },
        startTime: {
          type: "string",
          description:
            "Start time of the reservation. If timezone is not mentioned, assume singapore time. If no time is given, assume current time as the start",
        },
        endTime: {
          type: "string",
          description:
            "End time of the reservation. If timezone is not mentioned, assume singapore time. If no time is given, assume the end of the day as the end time.",
        },
      },
      required: ["roomName", "startTime", "endTime"],
    },
  },
  {
    name: "getAvailableRooms",
    description:
      "Get rooms which are available between start and end time, if timezone is not mentioned, assume singapore time",
    parameters: {
      type: "object",
      properties: {
        startTime: {
          type: "string",
          description: "Start time of the reservation",
        },
        endTime: {
          type: "string",
          description: "End time of the reservation",
        },
      },
      required: ["startTime", "endTime"],
    },
  },
  // {
  //   name: "suggestMeetingTimes",
  //   description:
  //     "Sometimes users may provides a range of time that is longer than the duration of the meeting. Given the range of time, suggest up to 5 meeting times that fit within the range of time. You can return less than 5 meeting times if there are not enough meeting times that fit within the range of time. After returning the dates, ask the user if he is satisfied with the times. Suggest again.",
  //   parameters: {
  //     type: "object",
  //     properties: {
  //       startTime: {
  //         type: "string",
  //         description: "Start time of the range of time that the user gave you",
  //       },
  //       endTime: {
  //         type: "string",
  //         description: "End time of the range of time that the user gave you",
  //       },
  //       durationOfMeeting: {
  //         type: "string",
  //         description: "Duration of the meeting that they are requesting for",
  //       },
  //     },
  //     required: ["startTime", "endTime", "durationOfMeeting"],
  //   }},
];

export const companyDetails = `
The following are the details of the company you are working for: GovTech Singapore
`;
const currentDate = moment();
export const systemPrompt = `Today is ${currentDate}. You are Samantha, a friendly and energetic meeting coordinator at GovTech Singapore. Your role is to help internal employees schedule meetings and interviews with external partners and vendors. Examples include weekly sales meetings, project kickoff calls, and contractor interviews.

The typical meeting lengths you coordinate are 30 minutes, 1 hour, or 2 hours. Most meetings are scheduled during core office hours of 9am - 6pm, Monday to Friday. Imply the duration from the start and end time if given

When employees request meetings, prompt for details like: desired meeting length, internal attendees, external visitors, and date/time preferences. Convert suggested relative dates into DD MMM YYYY format in your responses.

No functions should be called recursively. User should need to confirm between the calls of each function.
Provide options if meetings fall outside core hours. Convert dates to ISO format for function calls. NEVER ask the user to provide preferred room for their meetings."
Majority of meetings are held online, so VENUES AND ROOMS are not required. Unless the user specifically asks for room availability, DO NOT ASK ABOUT ROOM AVAILABILITY.
`;

export const emailPrompt = `You are Samantha, and you are writing an email to a client. Your email entails meeting details with a user, whos name will be provided to you later. Make sure to be formal and polite.

People will reply you regarding their availability of dates provided by you in the initiating email. You will need to process their responses and update the dates accordingly. The proposed should always be in SGT timezone. If the user does not provide a timezone, assume SGT timezone.

`;

export const emailResponseFunctions: ChatCompletionCreateParams.Function[] = [
  {
    name: "setUserAvailability",
    description: `Set the users availability for the given dates.

    If the user explicitly states availability for all dates, set the status to 'Yes' for all ranges.
    Otherwise, set the status based on the user's response for each individual range.
    If the user does not address a particular range, set its status to 'Not Responded'.
    The dates are in ISO format.
    Return the updated datesToCheck array.`,
    parameters: {
      required: ["datesToCheck"],
      type: "object",
      properties: {
        datesToCheck: {
          type: "array",
          items: {
            type: "object",
            properties: {
              startDate: {
                type: "string",
                description: "Start date of the meeting in ISO date string",
              },
              endDate: {
                type: "string",
                description: "End date of the meeting in ISO date string",
              },
              status: {
                type: "string",
                description: `Whether or not the user can attend. If he can attend, then 'Yes', if cannot, then 'No'. If the user did not respond to this option, then 'Not Responded'. If a user gives a general response like 'I am available for all dates', then set to 'Yes'.`,
              },
            },
          },
        },
      },
    },
  },
];
