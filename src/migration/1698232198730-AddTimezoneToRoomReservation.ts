import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTimezoneToRoomReservation1698232198730 implements MigrationInterface {
    name = 'AddTimezoneToRoomReservation1698232198730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation" ADD "event_title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "invitation_details" jsonb NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room_reservation" DROP COLUMN "start_time"`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ADD "start_time" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room_reservation" DROP COLUMN "end_time"`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ADD "end_time" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ALTER COLUMN "room_id" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ALTER COLUMN "room_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room_reservation" DROP COLUMN "end_time"`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ADD "end_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room_reservation" DROP COLUMN "start_time"`);
        await queryRunner.query(`ALTER TABLE "room_reservation" ADD "start_time" TIMESTAMP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "invitation_details"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "event_title"`);
    }

}
