import { MigrationInterface, QueryRunner } from "typeorm";

export class UserAddTimezoneColumn1698132127347 implements MigrationInterface {
    name = 'UserAddTimezoneColumn1698132127347'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "timezone" character varying NOT NULL DEFAULT 'Asia/Singapore'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timezone"`);
    }

}
