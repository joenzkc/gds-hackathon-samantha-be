import { MigrationInterface, QueryRunner } from "typeorm";

export class ConfirmedRoomEntity1698397696318 implements MigrationInterface {
    name = 'ConfirmedRoomEntity1698397696318'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "confirmed_meeting" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invitation_view_id" character varying NOT NULL, "room_id" character varying, "confirm_start_date" character varying NOT NULL, "confirmed_end_date" character varying NOT NULL, CONSTRAINT "PK_3905d6825e868e331031be1f204" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "confirmed_meeting"`);
    }

}
