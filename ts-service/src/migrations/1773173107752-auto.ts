import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1773173107752 implements MigrationInterface {
    name = 'Auto1773173107752'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "workspaces" ("id" character varying(64) NOT NULL, "name" character varying(120) NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_098656ae401f3e1a4586f47fd8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candidates" ("id" character varying(64) NOT NULL, "workspace_id" character varying(64) NOT NULL, "full_name" character varying(160) NOT NULL, "email" character varying(160), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_140681296bf033ab1eb95288abb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "candidate_documents" ("id" BIGSERIAL NOT NULL, "candidate_id" character varying NOT NULL, "document_type" text NOT NULL, "file_name" text NOT NULL, "storage_key" text NOT NULL, "raw_text" text NOT NULL, "uploaded_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a7b7572a2c5c1320a4249ce2b4c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2d1a14e9cb167a840b369a6cb7" ON "candidate_documents" ("candidate_id") `);
        await queryRunner.query(`CREATE TABLE "candidate_summaries" ("id" BIGSERIAL NOT NULL, "candidate_id" character varying NOT NULL, "status" character varying NOT NULL DEFAULT 'pending', "score" integer, "strengths" text, "concerns" text, "summary" text, "recommended_decision" text, "provider" text, "error_message" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "prompt_version" text NOT NULL DEFAULT 'v1.0', CONSTRAINT "PK_71af82300df454f7e82c777952e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_b033f7e869dac60987c01f8df7" ON "candidate_summaries" ("candidate_id") `);
        await queryRunner.query(`ALTER TABLE "candidates" ADD CONSTRAINT "FK_74e8e678b1531807c7f34493526" FOREIGN KEY ("workspace_id") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_documents" ADD CONSTRAINT "FK_2d1a14e9cb167a840b369a6cb71" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "candidate_summaries" ADD CONSTRAINT "FK_b033f7e869dac60987c01f8df7a" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "candidate_summaries" DROP CONSTRAINT "FK_b033f7e869dac60987c01f8df7a"`);
        await queryRunner.query(`ALTER TABLE "candidate_documents" DROP CONSTRAINT "FK_2d1a14e9cb167a840b369a6cb71"`);
        await queryRunner.query(`ALTER TABLE "candidates" DROP CONSTRAINT "FK_74e8e678b1531807c7f34493526"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b033f7e869dac60987c01f8df7"`);
        await queryRunner.query(`DROP TABLE "candidate_summaries"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2d1a14e9cb167a840b369a6cb7"`);
        await queryRunner.query(`DROP TABLE "candidate_documents"`);
        await queryRunner.query(`DROP TABLE "candidates"`);
        await queryRunner.query(`DROP TABLE "workspaces"`);
    }

}
