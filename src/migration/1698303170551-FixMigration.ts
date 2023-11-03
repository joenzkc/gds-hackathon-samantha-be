import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigration1698303170551 implements MigrationInterface {
    name = 'FixMigration1698303170551'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "invitation_view" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "inviter_id" character varying NOT NULL, "conversation_id" character varying NOT NULL, "expected_responses" integer NOT NULL, "current_responses" integer NOT NULL, "event_title" character varying NOT NULL, "invitation_view_status" text NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_6effe52bedd35211a15e031a962" UNIQUE ("conversation_id"), CONSTRAINT "PK_352addd135fca6f8cd3dcd6e3f3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "event_title"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "conversation_id"`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "invitation_view_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "is_visitor" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "status" text NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD CONSTRAINT "UQ_57056912e1c3ab0736617230b02" UNIQUE ("invitation_view_id", "invitee_email", "invitee_name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invitation" DROP CONSTRAINT "UQ_57056912e1c3ab0736617230b02"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "is_visitor"`);
        await queryRunner.query(`ALTER TABLE "invitation" DROP COLUMN "invitation_view_id"`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "conversation_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "invitation" ADD "event_title" character varying NOT NULL`);
        await queryRunner.query(`DROP TABLE "invitation_view"`);
    }

}
