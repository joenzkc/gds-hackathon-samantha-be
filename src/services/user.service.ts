import { User } from "../entities/user.entity";
import { Database } from "../datasource";
import Graph from "../graph";
import moment from "moment";
import { compare } from "bcryptjs";

export class UserService {
  public async getUserBySessionToken(sessionToken: string) {
    const userRepository = Database.AppDataSource.getRepository(User);
    return await userRepository.findOneBy({ outlookToken: sessionToken });
  }

  public async doesUserExist(token: string) {
    const userRepository = Database.AppDataSource.getRepository(User);

    const user = await userRepository.findOneBy({
      outlookToken: token,
    });

    return user !== undefined;
  }

  public async createUser(user: User) {
    const userRepository = Database.AppDataSource.getRepository(User);
    return await userRepository.save(user);
  }

  public async getUserGraphDetailsByEmail(email: string) {
    const userRepository = Database.AppDataSource.getRepository(User);
    const user = await userRepository.findOneBy({ outlookEmail: email });
    if (!user) {
      throw new Error("User not found");
    }

    const userDetails = await Graph.getUserDetails(user.outlookToken);
    return userDetails;
  }

  public async getUserEntityByEmail(email: string) {
    const userRepository = Database.AppDataSource.getRepository(User);
    return await userRepository.findOneBy({ outlookEmail: email });
  }

  public async getUsersSchedule(
    start: string,
    end: string,
    outlookEmail: string
  ) {
    const user = await this.getUserEntityByEmail(outlookEmail);
    console.log(user.outlookToken);
    const schedule = await Graph.getUsersSchedule(
      start,
      end,
      user.outlookToken,
      user.timezone
    );
    return schedule;
  }
}
