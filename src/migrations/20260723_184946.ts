import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('membre', 'gestionnaire', 'admin');
  CREATE TYPE "public"."enum_membres_genre" AS ENUM('homme', 'femme');
  CREATE TYPE "public"."enum_membres_poste_poste_cap" AS ENUM('Président d''honneur', 'Présidente d''honneur', 'Président', 'Présidente', 'Vice-Président', 'Vice-Présidente', 'Secrétaire général', 'Secrétaire générale', 'Secrétaire général adjoint', 'Secrétaire générale adjointe', 'Trésorier', 'Trésorière', 'Trésorier Adjoint', 'Trésorière Adjointe', 'Présidente Commission Actions Sociales', 'Présidente Commission Communication', 'President Commission Strategie Vulgarisation', 'Président Commission Renforcement de Capacités', 'Membre');
  CREATE TYPE "public"."enum_membres_adhesion_statut" AS ENUM('actif', 'inactif', 'suspendu');
  CREATE TYPE "public"."enum_activities_type" AS ENUM('atelier', 'seminaire');
  CREATE TYPE "public"."enum_activities_statut" AS ENUM('a_venir', 'en_cours', 'termine');
  CREATE TYPE "public"."enum_posts_categorie" AS ENUM('actualites', 'ateliers_seminaires');
  CREATE TYPE "public"."enum_posts_statut" AS ENUM('brouillon', 'publie');
  CREATE TYPE "public"."enum_documents_categorie" AS ENUM('textes_statutaires', 'textes_reglementaires', 'pv_reunion', 'ressources', 'magazines', 'docs_politique_economique');
  CREATE TYPE "public"."enum_documents_acces" AS ENUM('public', 'membres');
  CREATE TYPE "public"."enum_activity_registrations_statut" AS ENUM('inscrit', 'annule');
  CREATE TYPE "public"."enum_mediatheque_statut" AS ENUM('publie', 'brouillon');
  CREATE TYPE "public"."enum_pages_statut" AS ENUM('brouillon', 'publie');
  CREATE TYPE "public"."enum_blog_posts_statut" AS ENUM('draft', 'published');
  CREATE TABLE "users_sessions" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"created_at" timestamp(3) with time zone,
  	"expires_at" timestamp(3) with time zone NOT NULL
  );
  
  CREATE TABLE "users" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"role" "enum_users_role" DEFAULT 'membre' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"email" varchar NOT NULL,
  	"reset_password_token" varchar,
  	"reset_password_expiration" timestamp(3) with time zone,
  	"salt" varchar,
  	"hash" varchar,
  	"login_attempts" numeric DEFAULT 0,
  	"lock_until" timestamp(3) with time zone
  );
  
  CREATE TABLE "media" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"alt" varchar NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"url" varchar,
  	"thumbnail_u_r_l" varchar,
  	"filename" varchar,
  	"mime_type" varchar,
  	"filesize" numeric,
  	"width" numeric,
  	"height" numeric,
  	"focal_x" numeric,
  	"focal_y" numeric
  );
  
  CREATE TABLE "membres" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"user_id" integer,
  	"prenom" varchar NOT NULL,
  	"nom" varchar NOT NULL,
  	"genre" "enum_membres_genre",
  	"slug" varchar,
  	"photo_id" integer,
  	"justificatif_id" integer,
  	"biographie" jsonb,
  	"poste_poste_cap" "enum_membres_poste_poste_cap",
  	"poste_fonction_professionnelle" varchar,
  	"poste_organisme" varchar,
  	"poste_site_organisme" varchar,
  	"poste_direction" varchar,
  	"poste_logo_organisme_id" integer,
  	"coordonnees_telephone" varchar,
  	"coordonnees_telephone_secondaire" varchar,
  	"coordonnees_email_professionnel" varchar,
  	"coordonnees_linkedin" varchar,
  	"adhesion_numero_adhesion" varchar,
  	"adhesion_date_adhesion" timestamp(3) with time zone,
  	"adhesion_statut" "enum_membres_adhesion_statut" DEFAULT 'actif' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activities_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"fichier_id" integer NOT NULL
  );
  
  CREATE TABLE "activities" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"slug" varchar,
  	"type" "enum_activities_type",
  	"description" jsonb,
  	"lieu" varchar,
  	"date_debut" timestamp(3) with time zone NOT NULL,
  	"date_fin" timestamp(3) with time zone,
  	"image_id" integer,
  	"statut" "enum_activities_statut" DEFAULT 'a_venir' NOT NULL,
  	"places_disponibles" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "posts_images" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL
  );
  
  CREATE TABLE "posts_documents" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"fichier_id" integer NOT NULL
  );
  
  CREATE TABLE "posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"slug" varchar,
  	"contenu" jsonb NOT NULL,
  	"image_id" integer,
  	"categorie" "enum_posts_categorie" NOT NULL,
  	"statut" "enum_posts_statut" DEFAULT 'brouillon' NOT NULL,
  	"publie_le" timestamp(3) with time zone,
  	"auteur_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"couverture_id" integer,
  	"slug" varchar,
  	"fichier_id" integer NOT NULL,
  	"categorie" "enum_documents_categorie" NOT NULL,
  	"acces" "enum_documents_acces" DEFAULT 'public' NOT NULL,
  	"description" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "activity_registrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"member_id" integer NOT NULL,
  	"activity_id" integer NOT NULL,
  	"statut" "enum_activity_registrations_statut" DEFAULT 'inscrit' NOT NULL,
  	"inscrit_le" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mediatheque" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"slug" varchar,
  	"date" timestamp(3) with time zone,
  	"description" varchar,
  	"statut" "enum_mediatheque_statut" DEFAULT 'publie' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "mediatheque_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"media_id" integer
  );
  
  CREATE TABLE "pages" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"slug" varchar NOT NULL,
  	"description" varchar,
  	"extrait" varchar,
  	"citation" varchar,
  	"signature_nom" varchar,
  	"signature_titre" varchar,
  	"contenu" jsonb,
  	"sections" jsonb,
  	"statut" "enum_pages_statut" DEFAULT 'brouillon' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "partenaires" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"nom" varchar NOT NULL,
  	"logo_id" integer NOT NULL,
  	"site_web" varchar,
  	"ordre" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "blog_posts" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titre" varchar NOT NULL,
  	"slug" varchar,
  	"contenu" jsonb NOT NULL,
  	"image_id" integer,
  	"extrait" varchar,
  	"categorie" varchar,
  	"statut" "enum_blog_posts_statut" DEFAULT 'draft' NOT NULL,
  	"publie_le" timestamp(3) with time zone,
  	"auteur_id" integer NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_kv" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"data" jsonb NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"global_slug" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_locked_documents_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer,
  	"media_id" integer,
  	"membres_id" integer,
  	"activities_id" integer,
  	"posts_id" integer,
  	"documents_id" integer,
  	"activity_registrations_id" integer,
  	"mediatheque_id" integer,
  	"pages_id" integer,
  	"partenaires_id" integer,
  	"blog_posts_id" integer
  );
  
  CREATE TABLE "payload_preferences" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar,
  	"value" jsonb,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "payload_preferences_rels" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"order" integer,
  	"parent_id" integer NOT NULL,
  	"path" varchar NOT NULL,
  	"users_id" integer
  );
  
  CREATE TABLE "payload_migrations" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar,
  	"batch" numeric,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users_sessions" ADD CONSTRAINT "users_sessions_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "membres" ADD CONSTRAINT "membres_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membres" ADD CONSTRAINT "membres_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membres" ADD CONSTRAINT "membres_justificatif_id_media_id_fk" FOREIGN KEY ("justificatif_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "membres" ADD CONSTRAINT "membres_poste_logo_organisme_id_media_id_fk" FOREIGN KEY ("poste_logo_organisme_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities_documents" ADD CONSTRAINT "activities_documents_fichier_id_media_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activities_documents" ADD CONSTRAINT "activities_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "activities" ADD CONSTRAINT "activities_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_images" ADD CONSTRAINT "posts_images_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_images" ADD CONSTRAINT "posts_images_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts_documents" ADD CONSTRAINT "posts_documents_fichier_id_media_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts_documents" ADD CONSTRAINT "posts_documents_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_couverture_id_media_id_fk" FOREIGN KEY ("couverture_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "documents" ADD CONSTRAINT "documents_fichier_id_media_id_fk" FOREIGN KEY ("fichier_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_member_id_membres_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."membres"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "activity_registrations" ADD CONSTRAINT "activity_registrations_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "mediatheque_rels" ADD CONSTRAINT "mediatheque_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."mediatheque"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "mediatheque_rels" ADD CONSTRAINT "mediatheque_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "partenaires" ADD CONSTRAINT "partenaires_logo_id_media_id_fk" FOREIGN KEY ("logo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "blog_posts" ADD CONSTRAINT "blog_posts_auteur_id_users_id_fk" FOREIGN KEY ("auteur_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_locked_documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_fk" FOREIGN KEY ("media_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_membres_fk" FOREIGN KEY ("membres_id") REFERENCES "public"."membres"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activities_fk" FOREIGN KEY ("activities_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_posts_fk" FOREIGN KEY ("posts_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_documents_fk" FOREIGN KEY ("documents_id") REFERENCES "public"."documents"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_activity_registrations_fk" FOREIGN KEY ("activity_registrations_id") REFERENCES "public"."activity_registrations"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_mediatheque_fk" FOREIGN KEY ("mediatheque_id") REFERENCES "public"."mediatheque"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_pages_fk" FOREIGN KEY ("pages_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_partenaires_fk" FOREIGN KEY ("partenaires_id") REFERENCES "public"."partenaires"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_blog_posts_fk" FOREIGN KEY ("blog_posts_id") REFERENCES "public"."blog_posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."payload_preferences"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_preferences_rels" ADD CONSTRAINT "payload_preferences_rels_users_fk" FOREIGN KEY ("users_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "users_sessions_order_idx" ON "users_sessions" USING btree ("_order");
  CREATE INDEX "users_sessions_parent_id_idx" ON "users_sessions" USING btree ("_parent_id");
  CREATE INDEX "users_updated_at_idx" ON "users" USING btree ("updated_at");
  CREATE INDEX "users_created_at_idx" ON "users" USING btree ("created_at");
  CREATE UNIQUE INDEX "users_email_idx" ON "users" USING btree ("email");
  CREATE INDEX "media_updated_at_idx" ON "media" USING btree ("updated_at");
  CREATE INDEX "media_created_at_idx" ON "media" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_filename_idx" ON "media" USING btree ("filename");
  CREATE UNIQUE INDEX "membres_user_idx" ON "membres" USING btree ("user_id");
  CREATE UNIQUE INDEX "membres_slug_idx" ON "membres" USING btree ("slug");
  CREATE INDEX "membres_photo_idx" ON "membres" USING btree ("photo_id");
  CREATE INDEX "membres_justificatif_idx" ON "membres" USING btree ("justificatif_id");
  CREATE INDEX "membres_poste_poste_logo_organisme_idx" ON "membres" USING btree ("poste_logo_organisme_id");
  CREATE UNIQUE INDEX "membres_adhesion_adhesion_numero_adhesion_idx" ON "membres" USING btree ("adhesion_numero_adhesion");
  CREATE INDEX "membres_updated_at_idx" ON "membres" USING btree ("updated_at");
  CREATE INDEX "membres_created_at_idx" ON "membres" USING btree ("created_at");
  CREATE INDEX "activities_documents_order_idx" ON "activities_documents" USING btree ("_order");
  CREATE INDEX "activities_documents_parent_id_idx" ON "activities_documents" USING btree ("_parent_id");
  CREATE INDEX "activities_documents_fichier_idx" ON "activities_documents" USING btree ("fichier_id");
  CREATE UNIQUE INDEX "activities_slug_idx" ON "activities" USING btree ("slug");
  CREATE INDEX "activities_image_idx" ON "activities" USING btree ("image_id");
  CREATE INDEX "activities_updated_at_idx" ON "activities" USING btree ("updated_at");
  CREATE INDEX "activities_created_at_idx" ON "activities" USING btree ("created_at");
  CREATE INDEX "posts_images_order_idx" ON "posts_images" USING btree ("_order");
  CREATE INDEX "posts_images_parent_id_idx" ON "posts_images" USING btree ("_parent_id");
  CREATE INDEX "posts_images_image_idx" ON "posts_images" USING btree ("image_id");
  CREATE INDEX "posts_documents_order_idx" ON "posts_documents" USING btree ("_order");
  CREATE INDEX "posts_documents_parent_id_idx" ON "posts_documents" USING btree ("_parent_id");
  CREATE INDEX "posts_documents_fichier_idx" ON "posts_documents" USING btree ("fichier_id");
  CREATE UNIQUE INDEX "posts_slug_idx" ON "posts" USING btree ("slug");
  CREATE INDEX "posts_image_idx" ON "posts" USING btree ("image_id");
  CREATE INDEX "posts_auteur_idx" ON "posts" USING btree ("auteur_id");
  CREATE INDEX "posts_updated_at_idx" ON "posts" USING btree ("updated_at");
  CREATE INDEX "posts_created_at_idx" ON "posts" USING btree ("created_at");
  CREATE INDEX "documents_couverture_idx" ON "documents" USING btree ("couverture_id");
  CREATE UNIQUE INDEX "documents_slug_idx" ON "documents" USING btree ("slug");
  CREATE INDEX "documents_fichier_idx" ON "documents" USING btree ("fichier_id");
  CREATE INDEX "documents_updated_at_idx" ON "documents" USING btree ("updated_at");
  CREATE INDEX "documents_created_at_idx" ON "documents" USING btree ("created_at");
  CREATE INDEX "activity_registrations_member_idx" ON "activity_registrations" USING btree ("member_id");
  CREATE INDEX "activity_registrations_activity_idx" ON "activity_registrations" USING btree ("activity_id");
  CREATE INDEX "activity_registrations_updated_at_idx" ON "activity_registrations" USING btree ("updated_at");
  CREATE INDEX "activity_registrations_created_at_idx" ON "activity_registrations" USING btree ("created_at");
  CREATE UNIQUE INDEX "mediatheque_slug_idx" ON "mediatheque" USING btree ("slug");
  CREATE INDEX "mediatheque_updated_at_idx" ON "mediatheque" USING btree ("updated_at");
  CREATE INDEX "mediatheque_created_at_idx" ON "mediatheque" USING btree ("created_at");
  CREATE INDEX "mediatheque_rels_order_idx" ON "mediatheque_rels" USING btree ("order");
  CREATE INDEX "mediatheque_rels_parent_idx" ON "mediatheque_rels" USING btree ("parent_id");
  CREATE INDEX "mediatheque_rels_path_idx" ON "mediatheque_rels" USING btree ("path");
  CREATE INDEX "mediatheque_rels_media_id_idx" ON "mediatheque_rels" USING btree ("media_id");
  CREATE UNIQUE INDEX "pages_slug_idx" ON "pages" USING btree ("slug");
  CREATE INDEX "pages_updated_at_idx" ON "pages" USING btree ("updated_at");
  CREATE INDEX "pages_created_at_idx" ON "pages" USING btree ("created_at");
  CREATE INDEX "partenaires_logo_idx" ON "partenaires" USING btree ("logo_id");
  CREATE INDEX "partenaires_updated_at_idx" ON "partenaires" USING btree ("updated_at");
  CREATE INDEX "partenaires_created_at_idx" ON "partenaires" USING btree ("created_at");
  CREATE UNIQUE INDEX "blog_posts_slug_idx" ON "blog_posts" USING btree ("slug");
  CREATE INDEX "blog_posts_image_idx" ON "blog_posts" USING btree ("image_id");
  CREATE INDEX "blog_posts_auteur_idx" ON "blog_posts" USING btree ("auteur_id");
  CREATE INDEX "blog_posts_updated_at_idx" ON "blog_posts" USING btree ("updated_at");
  CREATE INDEX "blog_posts_created_at_idx" ON "blog_posts" USING btree ("created_at");
  CREATE UNIQUE INDEX "payload_kv_key_idx" ON "payload_kv" USING btree ("key");
  CREATE INDEX "payload_locked_documents_global_slug_idx" ON "payload_locked_documents" USING btree ("global_slug");
  CREATE INDEX "payload_locked_documents_updated_at_idx" ON "payload_locked_documents" USING btree ("updated_at");
  CREATE INDEX "payload_locked_documents_created_at_idx" ON "payload_locked_documents" USING btree ("created_at");
  CREATE INDEX "payload_locked_documents_rels_order_idx" ON "payload_locked_documents_rels" USING btree ("order");
  CREATE INDEX "payload_locked_documents_rels_parent_idx" ON "payload_locked_documents_rels" USING btree ("parent_id");
  CREATE INDEX "payload_locked_documents_rels_path_idx" ON "payload_locked_documents_rels" USING btree ("path");
  CREATE INDEX "payload_locked_documents_rels_users_id_idx" ON "payload_locked_documents_rels" USING btree ("users_id");
  CREATE INDEX "payload_locked_documents_rels_media_id_idx" ON "payload_locked_documents_rels" USING btree ("media_id");
  CREATE INDEX "payload_locked_documents_rels_membres_id_idx" ON "payload_locked_documents_rels" USING btree ("membres_id");
  CREATE INDEX "payload_locked_documents_rels_activities_id_idx" ON "payload_locked_documents_rels" USING btree ("activities_id");
  CREATE INDEX "payload_locked_documents_rels_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("posts_id");
  CREATE INDEX "payload_locked_documents_rels_documents_id_idx" ON "payload_locked_documents_rels" USING btree ("documents_id");
  CREATE INDEX "payload_locked_documents_rels_activity_registrations_id_idx" ON "payload_locked_documents_rels" USING btree ("activity_registrations_id");
  CREATE INDEX "payload_locked_documents_rels_mediatheque_id_idx" ON "payload_locked_documents_rels" USING btree ("mediatheque_id");
  CREATE INDEX "payload_locked_documents_rels_pages_id_idx" ON "payload_locked_documents_rels" USING btree ("pages_id");
  CREATE INDEX "payload_locked_documents_rels_partenaires_id_idx" ON "payload_locked_documents_rels" USING btree ("partenaires_id");
  CREATE INDEX "payload_locked_documents_rels_blog_posts_id_idx" ON "payload_locked_documents_rels" USING btree ("blog_posts_id");
  CREATE INDEX "payload_preferences_key_idx" ON "payload_preferences" USING btree ("key");
  CREATE INDEX "payload_preferences_updated_at_idx" ON "payload_preferences" USING btree ("updated_at");
  CREATE INDEX "payload_preferences_created_at_idx" ON "payload_preferences" USING btree ("created_at");
  CREATE INDEX "payload_preferences_rels_order_idx" ON "payload_preferences_rels" USING btree ("order");
  CREATE INDEX "payload_preferences_rels_parent_idx" ON "payload_preferences_rels" USING btree ("parent_id");
  CREATE INDEX "payload_preferences_rels_path_idx" ON "payload_preferences_rels" USING btree ("path");
  CREATE INDEX "payload_preferences_rels_users_id_idx" ON "payload_preferences_rels" USING btree ("users_id");
  CREATE INDEX "payload_migrations_updated_at_idx" ON "payload_migrations" USING btree ("updated_at");
  CREATE INDEX "payload_migrations_created_at_idx" ON "payload_migrations" USING btree ("created_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "users_sessions" CASCADE;
  DROP TABLE "users" CASCADE;
  DROP TABLE "media" CASCADE;
  DROP TABLE "membres" CASCADE;
  DROP TABLE "activities_documents" CASCADE;
  DROP TABLE "activities" CASCADE;
  DROP TABLE "posts_images" CASCADE;
  DROP TABLE "posts_documents" CASCADE;
  DROP TABLE "posts" CASCADE;
  DROP TABLE "documents" CASCADE;
  DROP TABLE "activity_registrations" CASCADE;
  DROP TABLE "mediatheque" CASCADE;
  DROP TABLE "mediatheque_rels" CASCADE;
  DROP TABLE "pages" CASCADE;
  DROP TABLE "partenaires" CASCADE;
  DROP TABLE "blog_posts" CASCADE;
  DROP TABLE "payload_kv" CASCADE;
  DROP TABLE "payload_locked_documents" CASCADE;
  DROP TABLE "payload_locked_documents_rels" CASCADE;
  DROP TABLE "payload_preferences" CASCADE;
  DROP TABLE "payload_preferences_rels" CASCADE;
  DROP TABLE "payload_migrations" CASCADE;
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum_membres_genre";
  DROP TYPE "public"."enum_membres_poste_poste_cap";
  DROP TYPE "public"."enum_membres_adhesion_statut";
  DROP TYPE "public"."enum_activities_type";
  DROP TYPE "public"."enum_activities_statut";
  DROP TYPE "public"."enum_posts_categorie";
  DROP TYPE "public"."enum_posts_statut";
  DROP TYPE "public"."enum_documents_categorie";
  DROP TYPE "public"."enum_documents_acces";
  DROP TYPE "public"."enum_activity_registrations_statut";
  DROP TYPE "public"."enum_mediatheque_statut";
  DROP TYPE "public"."enum_pages_statut";
  DROP TYPE "public"."enum_blog_posts_statut";`)
}
