import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies";
import { join } from "path";
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions";
import { config } from "dotenv";
config();
export class Database {
  public static AppDataSource: DataSource;

  public static createPostgresDataSource(options: PostgresConnectionOptions) {
    return new DataSource(options);
  }

  public static async setupDb() {
    let DB_OPTIONS: PostgresConnectionOptions = {
      type: "postgres",
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      synchronize: false,
      logging: false,
      ssl: process.env.NODE_ENV === "local" ? false : true,
      extra:
        process.env.NODE_ENV === "local"
          ? {}
          : {
              ssl: {
                rejectUnauthorized: false,
              },
            },
      entities: [join(__dirname, "/../**/**.entity{.ts,.js}")],
      namingStrategy: new SnakeNamingStrategy(),
    };

    this.AppDataSource = this.createPostgresDataSource(DB_OPTIONS);

    try {
      await this.AppDataSource.initialize();
      console.log("Database connection established");
    } catch (error) {
      console.error("Error while connecting to the database", error);
      throw error;
    }
  }
}

const MigrationDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [join(__dirname, "/../**/**.entity{.ts,.js}")],
  ssl: process.env.NODE_ENV === "local" ? false : true,
  extra:
    process.env.NODE_ENV === "local"
      ? {}
      : {
          ssl: {
            rejectUnauthorized: false,
          },
        },
  // entities: [Room, User],
  namingStrategy: new SnakeNamingStrategy(),
  migrations: [join(__dirname + "/migration/*{.ts,.js}")],
});

export default MigrationDataSource;
