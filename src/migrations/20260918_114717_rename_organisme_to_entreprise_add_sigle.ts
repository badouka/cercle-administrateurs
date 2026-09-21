import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membres" RENAME COLUMN "poste_organisme" TO "poste_entreprise";
  ALTER TABLE "membres" ADD COLUMN IF NOT EXISTS "poste_sigle" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "membres" RENAME COLUMN "poste_entreprise" TO "poste_organisme";
  ALTER TABLE "membres" DROP COLUMN "poste_sigle";`)
}
