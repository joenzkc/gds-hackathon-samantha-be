import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserTable1697970447197 implements MigrationInterface {
    name = 'AddUserTable1697970447197'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "outlook_token" character varying, "display_name" character varying NOT NULL, "outlook_email" character varying NOT NULL, CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
    }

}
