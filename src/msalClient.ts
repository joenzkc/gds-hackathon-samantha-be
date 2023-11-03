import { ConfidentialClientApplication, LogLevel } from "@azure/msal-node";
import { config } from "dotenv";
config();
class msalClient {
  public static msalClient: ConfidentialClientApplication;

  public static setupMsalClient() {
    const msalConfig = {
      auth: {
        clientId: process.env.OAUTH_CLIENT_ID || "",
        authority: process.env.OAUTH_AUTHORITY,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
      },
      system: {
        loggerOptions: {
          loggerCallback(loglevel: any, message: any, containsPii: any) {
            if (!containsPii) {
              console.log(message);
            }
          },
          piiLoggingEnabled: false,
          logLevel: LogLevel.Verbose,
        },
      },
    };

    this.msalClient = new ConfidentialClientApplication(msalConfig);
  }
}

msalClient.setupMsalClient();
export { msalClient };
