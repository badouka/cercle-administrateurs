-- Ajoute « Membre d'honneur » à l'énumération de poste.posteCap.
--
-- À jouer AVANT tout démarrage de Payload sur une base qui ne connaît pas
-- encore cette valeur : le push de schéma de Payload s'appuie sur drizzle-kit,
-- qui n'échappe pas l'apostrophe et produit un
--   ALTER TYPE … ADD VALUE 'Membre d'honneur'  -> syntax error
-- Le faire à la main en amont rend le push sans objet : la valeur existe déjà,
-- drizzle ne génère plus rien.
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f scripts/sql/membre-honneur-enum.sql

ALTER TYPE "public"."enum_membres_poste_poste_cap"
  ADD VALUE IF NOT EXISTS 'Membre d''honneur' AFTER 'Présidente d''honneur';
