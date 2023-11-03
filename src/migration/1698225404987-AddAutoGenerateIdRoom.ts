import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAutoGenerateIdRoom1698225404987 implements MigrationInterface {
    name = 'AddAutoGenerateIdRoom1698225404987'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "room" ALTER COLUMN "id" DROP DEFAULT`);
    }

}
