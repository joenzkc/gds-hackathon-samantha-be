import { msalClient } from "../msalClient";

export class AuthService {
  async signIn() {
    const scopes =
      process.env.OAUTH_SCOPES || "https://graph.microsoft.com/.default";
    const urlParameters = {
      scopes: scopes.split(","),
      redirectUri: process.env.OAUTH_REDIRECT_URI,
    };
    try {
      const authUrl = await msalClient.msalClient.getAuthCodeUrl(urlParameters);
      return authUrl;
    } catch (error) {
      console.log(`Error: ${error}`);
    }
  }
}
