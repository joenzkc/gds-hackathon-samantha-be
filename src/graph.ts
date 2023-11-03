import { Client } from "@microsoft/microsoft-graph-client";
import { msalClient } from "./msalClient";
import moment from "moment";

class Graph {
  public getAuthenticatedClient(userId: string) {
    if (!msalClient.msalClient || !userId) {
      throw new Error(
        `Invalid MSAL state. Client: ${
          msalClient.msalClient ? "present" : "missing"
        }, User ID: ${userId ? "present" : "missing"}`
      );
    }

    const client = Client.init({
      authProvider: async (done) => {
        try {
          // const account = await msalClient.msalClient.getTokenCache().getAccountByHomeId(userId);
          const account = await msalClient.msalClient
            .getTokenCache()
            .getAccountByHomeId(userId);

          if (account) {
            const scopes =
              process.env.OAUTH_SCOPES ||
              "https://graph.microsoft.com/.default";
            const response = await msalClient.msalClient.acquireTokenSilent({
              scopes: scopes.split(","),
              account: account,
            });

            done(null, response.accessToken);
          }
        } catch (err) {
          console.log(err);
          done(err, null);
        }
      },
    });

    return client;
  }

  public async getUserDetails(userId: string) {
    console.log(userId);
    const client = this.getAuthenticatedClient(userId);

    const user = await client
      .api("/me")
      .select("displayName,mail,mailboxSettings,userPrincipalName")
      .get();
    return user;
  }

  public async getUsersSchedule(
    start: string,
    end: string,
    outlookToken: string,
    timezone: string
  ) {
    const startDate = moment(start).toISOString();
    const endDate = moment(end).toISOString();
    const client = this.getAuthenticatedClient(outlookToken);

    try {
      const schedule = await client
        .api(
          `/me/calendarView?startDateTime=${startDate}&endDateTime=${endDate}`
        )
        .header("Prefer", `outlook.timezone="${timezone}"`)
        .select("subject,start,end,attendees")
        .orderby("start/dateTime DESC")
        .get();
      return schedule;
    } catch (err) {
      console.log("failed to retrieve schedule: ", err);
    }
  }
}

export default new Graph();
