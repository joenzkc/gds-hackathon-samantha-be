import { MigrationInterface, QueryRunner } from "typeorm";

export class FixMigration21698391194982 implements MigrationInterface {
    name = 'FixMigration21698391194982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "user_email" character varying`);
        await queryRunner.query(`ALTER TABLE "conversation" ADD "conversation_type" text NOT NULL DEFAULT 'chat'`);
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "user_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ALTER COLUMN "user_id" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "conversation_type"`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "user_email"`);
    }

}
