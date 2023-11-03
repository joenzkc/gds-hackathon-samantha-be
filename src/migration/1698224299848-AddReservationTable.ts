import { MigrationInterface, QueryRunner } from "typeorm";

export class AddReservationTable1698224299848 implements MigrationInterface {
    name = 'AddReservationTable1698224299848'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "room_reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservee_id" character varying NOT NULL, "start_time" TIMESTAMP NOT NULL, "end_time" TIMESTAMP NOT NULL, "room_id" character varying NOT NULL, "status" text NOT NULL, "other_data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b3fcbc70588b2d594890d2824b1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "created_at"`);
        await queryRunner.query(`DROP TABLE "room_reservation"`);
    }

}
