import OpenAI from "openai";
import { ChatCompletionMessageParam } from "openai/resources";
import {
  emailPrompt,
  emailResponseFunctions,
  functions,
  systemPrompt,
} from "../gpt/gpt.functions";
import { RoomService } from "./room.service";
import { UserService } from "./user.service";
import moment from "moment-timezone";
import { randomUUID } from "crypto";
import {
  ConversationMetadata,
  ConversationStatus,
  ConversationType,
  GptContextMetadata,
} from "../models/conversation.model";
import { InvitationService } from "./invitation.service";
import {
  InvitationDateDetails,
  InvitationViewStatus,
  InviteeDetails,
} from "../models/invitation.model";
import { User } from "../entities/user.entity";
import { Invitation } from "../entities/invitation.entity";
import { Room } from "../entities/room.entity";
import { Database } from "../datasource";
import { InvitationView } from "../entities/invitationView.entity";
import { Conversation } from "../entities/conversation.entity";
import { ConversationService } from "./conversation.service";
import AWS, { Lambda, Config } from "aws-sdk";

export class OpenAiService {
  private openAi: OpenAI = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "",
    dangerouslyAllowBrowser: true,
  });
  private roomService: RoomService = new RoomService();
  private userService: UserService = new UserService();
  private invitationService: InvitationService = new InvitationService();
  private convoService: ConversationService = new ConversationService();
  private lambda: Lambda = new Lambda();

  constructor() {
    console.log();
  }

  public async askGpt(messageToSend: ChatCompletionMessageParam[]) {
    console.log("ask gpt:", messageToSend);
    let response = await this.openAi.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4",
      messages: messageToSend,
      functions: functions,
      function_call: "auto",
      temperature: 0.2,
    });
    return response;
  }

  public async askGptWithNoFunctions(
    messageToSend: ChatCompletionMessageParam[]
  ) {
    console.log("ask gpt with no functions:", messageToSend);
    let response = await this.openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messageToSend,
      temperature: 0.2,
    });
    return response;
  }

  public async suggestTitle(prompt: string) {
    console.log("suggesting a title:");
    let response = await this.openAi.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: `Given this prompt: "${prompt}", suggest an appropriate title for this conversation. The title should be concise, and give me only the title with no quotation marks`,
        },
      ],
    });
    return response.choices[0].message.content;
  }

  public async functionController(
    userToken: string,
    messageToSend: ChatCompletionMessageParam[],
    prompt: string,
    existingChatHistory?: ConversationMetadata[],
    convoId?: string
  ) {
    const user = await this.userService.getUserBySessionToken(userToken);

    const chatHistory: ConversationMetadata[] = existingChatHistory
      ? existingChatHistory
      : [];

    let suggestedTitle = "";

    if (chatHistory.length === 0) {
      suggestedTitle = await this.suggestTitle(prompt);
    }
    chatHistory.push({
      sender: "user",
      message: prompt,
      timestamp: moment.tz("Asia/Singapore").toDate(),
      id: randomUUID(),
    });
    console.log("function controller chat history:", chatHistory);
    messageToSend[0].content = systemPrompt;
    console.log("function controller message to send", messageToSend);

    let response = await this.askGpt(messageToSend);
    while (
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== "stop"
    ) {
      let message = response.choices[0].message;
      if (!message || !message.function_call) {
        return;
      }
      const functionToCall = message.function_call.name;
      console.log("functiontocall: ", functionToCall);
      let functionResponse = "";
      switch (functionToCall) {
        // case "getUserGraphDetailsByEmail":
        //   const functionArgs = JSON.parse(message.function_call.arguments);
        //   functionResponse = await this.getUserGraphDetailsByEmail(
        //     functionArgs.userEmail
        //   );
        //   break;
        case "getAvailableRooms":
          const functionArgs2 = JSON.parse(message.function_call.arguments);
          functionResponse = await this.getAvailableRooms(
            functionArgs2.startTime,
            functionArgs2.endTime
          );
          break;
        case "getRoomsAvailability":
          const functionArgs3 = JSON.parse(message.function_call.arguments);
          functionResponse = await this.getRoomsAvailability(
            functionArgs3.roomName,
            functionArgs3.startTime,
            functionArgs3.endTime
          );
          break;
        case "suggestMeetingTimes":
          const functionArgs4 = JSON.parse(message.function_call.arguments);
          functionResponse = await this.suggestMeetingTimes(
            functionArgs4.startTime,
            functionArgs4.endTime,
            functionArgs4.durationOfMeeting
          );
          break;
        case "createInvite":
          const functionArgs6 = JSON.parse(message.function_call.arguments);
          functionResponse = await this.confirmInviteCreation(
            functionArgs6.participants,
            functionArgs6.timeslots,
            functionArgs6.eventTitle,
            convoId,
            user,
            functionArgs6.isConfirmed
          );
          break;
        default:
          throw new Error("error :(");
      }
      console.log("function response:", functionResponse);

      messageToSend.push({
        role: "function",
        name: functionToCall,
        content: functionResponse,
      });
      response = await this.askGpt(messageToSend);
    }

    messageToSend.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    chatHistory.push({
      sender: "gpt",
      message: response.choices[0].message.content,
      timestamp: moment.tz("Asia/Singapore").toDate(),
      id: randomUUID(),
    });
    return { response, messageToSend, chatHistory, suggestedTitle };
  }

  public async suggestMeetingTimes(
    startTime: string,
    endTime: string,
    duration: string
  ) {
    const messagesToSend: ChatCompletionMessageParam[] = [
      {
        role: "user",
        content:
          "From the given start and end time, suggest a meeting time. You can suggest up to 5 meeting times, but less is fine too. Return the answer in a list of strings, where each string is a meeting time." +
          `Start time: ${startTime}, End time: ${endTime}, Duration: ${duration}. Give the dates in the format YYYY-MM-DD HH:mm, and the timezone is SGT`,
      },
    ];
    const response = await this.askGptWithNoFunctions(messagesToSend);
    console.log("message:", response.choices[0].message);
    const suggestedMeetingTimes = response.choices[0].message.content;
    return JSON.stringify({
      msg: "Meeting times suggested",
      data: suggestedMeetingTimes,
    });
  }

  public async getRoomsAvailability(
    roomName: string,
    startTime: string,
    endTime: string
  ) {
    try {
      if (!startTime || !endTime) {
        return JSON.stringify({
          msg: "Please provide a start and end time",
        });
      }
      const closestRoom = (await this.roomService.getClosestRoomName(
        roomName
      )) as Room;
      const isRoomAvailable = await this.roomService.isRoomAvailable(
        startTime,
        endTime,
        closestRoom.id
      );
      return JSON.stringify({
        msg: "Room availability checked",
        data: isRoomAvailable,
      });
    } catch (err) {
      if (err.message === "No room found") {
        return JSON.stringify({
          msg: "No room with such name found",
        });
      }
    }
  }

  public async liaiseMeetings(entityManager = Database.AppDataSource.manager) {
    const invitationRepo = entityManager.getRepository(Invitation);
    const invitationViewRepo = entityManager.getRepository(InvitationView);
    const userRepo = entityManager.getRepository(User);

    const liaisingInvitationViews: InvitationView[] =
      await invitationViewRepo.find({
        where: {
          invitationViewStatus: InvitationViewStatus.SENDING_EMAILS,
        },
      });

    for (const invitationView of liaisingInvitationViews) {
      const invitations = await invitationRepo.find({
        where: {
          invitationViewId: invitationView.id,
        },
      });
      console.log("invitation view:", invitationView);

      const userId = invitationView.inviterId;
      console.log(userId);
      const user = await userRepo.findOneOrFail({
        where: {
          id: userId,
        },
      });

      for (const invitation of invitations) {
        console.log("invitation", invitation);
        // call gpt function to write an email to the invitee, needs user details
        // askGpt(user, invitationView.title, invitation)
        const { emailToSend, messagesToSend } =
          await this.initiateEmailWithUser(invitationView, invitation, user);
        console.log(emailToSend);
        const conversationHistory: ConversationMetadata[] = [
          {
            id: randomUUID(),
            sender: "gpt",
            message: emailToSend,
            timestamp: moment.tz("Asia/Singapore").toDate(),
          },
        ];
        // create conversation in db
        const conversation = new Conversation(
          null,
          `Invitation View Id: ${invitationView.id}`,
          conversationHistory,
          { messages: messagesToSend },
          ConversationStatus.ACTIVE,
          ConversationType.EMAIL,
          invitation.inviteeEmail,
          invitationView.conversationId
        );
        const conversationRepo = entityManager.getRepository(Conversation);
        const savedConversation = await conversationRepo.save(conversation);

        // call lambda function to write an email, needs to tag in
        AWS.config.update({
          region: "ap-southeast-1",
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        });
        const payload = {
          FunctionName: "send-to-recipient-lambda",
          Payload: JSON.stringify({
            email_message: emailToSend,
            recipient_email: invitation.inviteeEmail,
            conversation_id: savedConversation.id,
          }),
        };
        const lambda = new Lambda();
        console.log(payload);
        const test = lambda.invoke(payload, (err, data) => {
          if (err) {
            console.log(err);
          }
          console.log(data);
        });

        console.log(test);
      }

      // update invitation view status to "liaised"
      invitationView.invitationViewStatus = InvitationViewStatus.PENDING;
      await invitationViewRepo.save(invitationView);
    }
  }

  public async initiateEmailWithUser(
    invitationView: InvitationView,
    invitation: Invitation,
    user: User
  ) {
    const messagesToSend: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `"You are Samantha, and you are the AI personal assistant for the user ${
          user.displayName
        }. You are trying to book a meeting with ${
          invitation.inviteeName
        }. This is the name of the meeting: ${
          invitationView.eventTitle
        } Provided are the possible range of meeting dates provided by ${
          user.displayName
        } (Note, the invitee may not be available on these dates, these are provided by ${
          user.displayName
        }, so ask courteously if they are available on any of them):
      ${JSON.stringify(
        invitation.invitationDetails
      )} Please write an email to invite ${
          invitation.inviteeName
        } to the meeting. Introduce yourself as Samantha, and ${
          user.displayName
        }'s AI personal assistant. Include the following details in the email. Be concise with your invite. `,
      },
    ];

    let response = await this.askGptWithNoFunctions(messagesToSend);
    console.log("message:", response.choices[0].message);
    messagesToSend.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });

    return { emailToSend: response.choices[0].message.content, messagesToSend };

    // const emailPrompt = [{
    //   type: "system",
    //   content: emailPrompt
    // }]
  }

  public async replyEmail(
    convoId: string,
    message: string,
    emailAddress: string,
    entityManager = Database.AppDataSource.manager
  ) {
    const convo = await this.convoService.getConversationById(
      convoId,
      entityManager
    );
    const exisitingChatHistory = convo.convoMetadata;
    const messagesToSend = convo.gptContextMetadata.messages;
    messagesToSend.push({ role: "user", content: message });

    // ask gpt
    let { response, messageToSend, chatHistory } =
      await this.functionControllerForEmails(
        messagesToSend,
        exisitingChatHistory,
        convoId,
        emailAddress
      );

    await this.sendEmailLambda(
      response.choices[0].message.content,
      emailAddress,
      convoId
    );

    // update conversation
    await this.convoService.updateConversationById(
      convoId,
      messageToSend,
      chatHistory,
      entityManager
    );

    return response;
  }

  public async sendEmailLambda(
    message: string,
    emailAddress: string,
    conversationId: string
  ) {
    AWS.config.update({
      region: "ap-southeast-1",
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const payload = {
      FunctionName: "send-to-recipient-lambda",
      Payload: JSON.stringify({
        email_message: message,
        recipient_email: emailAddress,
        conversation_id: conversationId,
      }),
    };
    const lambda = new Lambda();
    console.log(payload);
    const test = lambda.invoke(payload, (err, data) => {
      if (err) {
        console.log(err);
      }
      console.log(data);
    });

    console.log(test);
  }

  public async askGptForEmails(messageToSend: ChatCompletionMessageParam[]) {
    console.log("ask gpt for emails", messageToSend);
    let response = await this.openAi.chat.completions.create({
      // model: "gpt-3.5-turbo",
      model: "gpt-4",
      messages: messageToSend,
      functions: emailResponseFunctions,
      function_call: "auto",
      temperature: 0.2,
    });
    return response;
  }

  public async functionControllerForEmails(
    messageToSend: ChatCompletionMessageParam[],
    chatHistory: ConversationMetadata[],
    conversationId: string,
    emailAddress: string
  ) {
    let response = await this.askGptForEmails(messageToSend);
    console.log(
      "response email function controller:",
      response.choices[0].message
    );
    while (
      response.choices[0].message.function_call &&
      response.choices[0].finish_reason !== "stop"
    ) {
      let message = response.choices[0].message;
      if (!message || !message.function_call) {
        return;
      }
      const functionToCall = message.function_call.name;
      console.log(functionToCall);
      let functionResponse = "";
      switch (functionToCall) {
        case "setUserAvailability":
          const functionArgs = JSON.parse(message.function_call.arguments);
          functionResponse = await this.updateAvailabilityDates(
            conversationId,
            emailAddress,
            functionArgs.datesToCheck
          );
          break;
        default:
          console.log(functionToCall);
          throw new Error("Function not found");
      }

      console.log("function response:", functionResponse);

      messageToSend.push({
        role: "function",
        name: functionToCall,
        content: functionResponse,
      });
      response = await this.askGptForEmails(messageToSend);
    }

    messageToSend.push({
      role: "assistant",
      content: response.choices[0].message.content,
    });
    console.log("message to send:", messageToSend);

    chatHistory.push({
      sender: "gpt",
      message: response.choices[0].message.content,
      timestamp: moment.tz("Asia/Singapore").toDate(),
      id: randomUUID(),
    });

    return { response, messageToSend, chatHistory };
    // return { response, messageToSend, chatHistory, suggestedTitle };
  }

  public async updateAvailabilityDates(
    conversationId: string,
    emailAddress: string,
    datesToCheck: InvitationDateDetails[]
  ) {
    console.log("dates to check", datesToCheck);
    const conversation: Conversation =
      await this.convoService.getConversationById(conversationId);
    const parentConvoId = conversation.parentConversation;

    const invitationView =
      await this.invitationService.getInvitationViewByConvoId(parentConvoId);
    let invitation: Invitation =
      await this.invitationService.getInvitationByEmailAndViewId(
        invitationView.id,
        emailAddress
      );
    const updated = await this.invitationService.updateInvitationDateDetails(
      invitation.id,
      datesToCheck
    );

    return JSON.stringify({
      msg: `Updated ${emailAddress} available dates`,
      data: updated,
    });

    // await this.invitationService.updateInvitationStatus(conversation.id, )
  }

  public async getUserGraphDetailsByEmail(email: string) {
    const user = await this.userService.getUserGraphDetailsByEmail(email);
    return JSON.stringify({ msg: "Employee details gotten", data: user });
  }

  public async getAvailableRooms(startDate: string, endDate: string) {
    const availableRooms = await this.roomService.getAvailableRooms(
      startDate,
      endDate
    );
    return JSON.stringify({
      msg: "Available rooms gotten",
      data: availableRooms,
    });
  }

  public async createRoom(roomCapacity: number, roomName: string) {
    if (!roomCapacity) {
      return JSON.stringify({
        msg: "Please provide a capacity for your room",
      });
    }
    if (!roomName) {
      return JSON.stringify({
        msg: "Please provide a name for your room",
      });
    }
    if (!roomCapacity && !roomName) {
      return JSON.stringify({
        msg: "Please provide capacity and name for your room",
      });
    }
    const newRoom = await this.roomService.createRoom(roomName, roomCapacity);
    return JSON.stringify({
      msg: `Room ${roomName} created`,
    });
  }

  public async confirmInviteCreation(
    participants: InviteeDetails[],
    timeslots: InvitationDateDetails[],
    eventTitle: string,
    convoId: string,
    user: User,
    isConfirmed: boolean
  ) {
    console.log("participants", participants);
    console.log("timeslots", timeslots);
    console.log("eventTitle", eventTitle);
    console.log("isConfirmed", isConfirmed);
    if (!participants && !timeslots && !eventTitle) {
      return JSON.stringify({
        msg: "Please provide details of your participants (name and email), potential meeting timeslots (start and end datetime) and an event title",
      });
    }

    if (!participants) {
      return JSON.stringify({
        msg: "Please provide details of your participants (name and email)",
      });
    }
    if (!timeslots) {
      return JSON.stringify({
        msg: "Please provide potential meeting timeslots (start and end datetime)",
      });
    }
    if (!eventTitle) {
      return JSON.stringify({
        msg: "Please provide an event title",
      });
    }
    if (convoId && isConfirmed) {
      const invite = await this.invitationService.createInviteForAttendees(
        convoId,
        user.id,
        participants,
        eventTitle,
        timeslots
      );
      return JSON.stringify({
        msg: `Invite created with id ${invite.invitationView.id}`,
      });
    }

    return JSON.stringify({
      msg: `Please confirm the meeting invite details. 
        Event Name: ${eventTitle},
        Participants: ${participants.map((participant) => participant.name)}
        Participants Email: ${participants.map(
          (participant) => participant.email
        )}
        Potential Meeting Timeslots: ${JSON.stringify(timeslots)}.
        If the details are correct, please confirm the meeting invite by typing "Yes" to create the meeting invite. If not, please type "No". Don't call this function recurisvely, only call it once until a user responds`,
    });
  }

  public async createInvite(
    participants: InviteeDetails[],
    timeslots: InvitationDateDetails[],
    eventTitle: string,
    convoId: string,
    user: User
  ) {
    const invite = await this.invitationService.createInviteForAttendees(
      convoId,
      user.id,
      participants,
      eventTitle,
      timeslots
    );
    return JSON.stringify({
      msg: `Invite created with id ${invite.invitationView.id}`,
    });
  }

  public async dummyTest() {
    const colour = "Red";
    return colour;
  }
}
