import { MigrationInterface, QueryRunner } from "typeorm";

export class AddConversationTitle1698280440217 implements MigrationInterface {
    name = 'AddConversationTitle1698280440217'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "conversation_title" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "conversation_title"`);
    }

}
