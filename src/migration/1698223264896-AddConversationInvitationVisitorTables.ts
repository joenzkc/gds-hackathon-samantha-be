import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationInvitationVisitorTables1698223264896 implements MigrationInterface {
    name = 'AddConversationInvitationVisitorTables1698223264896'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "conversation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" character varying NOT NULL, "convo_metadata" jsonb NOT NULL DEFAULT '{}', "gpt_context_metadata" jsonb NOT NULL DEFAULT '{}', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_864528ec4274360a40f66c29845" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "visitor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "email" character varying NOT NULL, "conversation_id" character varying NOT NULL, "visit_date_and_time" date NOT NULL, "inviter_id" character varying NOT NULL, CONSTRAINT "PK_ba6ae421d03de90a99ed838741d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "invitation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "invitee_name" character varying NOT NULL, "invitee_email" character varying NOT NULL, "inviter_id" character varying NOT NULL, "status" text NOT NULL, "conversation_id" character varying NOT NULL, CONSTRAINT "PK_beb994737756c0f18a1c1f8669c" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "invitation"`);
        await queryRunner.query(`DROP TABLE "visitor"`);
        await queryRunner.query(`DROP TABLE "conversation"`);
    }

}
