import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewColumn1698492092476 implements MigrationInterface {
    name = 'AddNewColumn1698492092476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" ADD "parent_conversation" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "conversation" DROP COLUMN "parent_conversation"`);
    }

}
