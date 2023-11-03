import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1697631553808 implements MigrationInterface {
    name = 'InitialMigration1697631553808'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room" ("id" uuid NOT NULL, "room_name" character varying NOT NULL, "room_capacity" integer NOT NULL, "other_attributes" jsonb, CONSTRAINT "PK_c6d46db005d623e691b2fbcba23" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "room"`);
    }

}
