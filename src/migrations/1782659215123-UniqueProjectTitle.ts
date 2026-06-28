import { MigrationInterface, QueryRunner } from "typeorm";

export class UniqueProjectTitle1782659215123 implements MigrationInterface {
    name = 'UniqueProjectTitle1782659215123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" ADD CONSTRAINT "UQ_bb3572d0016bd530a1e74cf256b" UNIQUE ("title", "owner_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP CONSTRAINT "UQ_bb3572d0016bd530a1e74cf256b"`);
    }

}
