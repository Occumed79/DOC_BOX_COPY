-- Source Vault / DocBox schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS sv_folders (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name        TEXT NOT NULL,
  parent_id   UUID REFERENCES sv_folders(id) ON DELETE CASCADE,
  color       TEXT NOT NULL DEFAULT '#3b82f6',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sv_files (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id      UUID REFERENCES sv_folders(id) ON DELETE SET NULL,
  name           TEXT NOT NULL,
  original_name  TEXT NOT NULL,
  file_type      TEXT NOT NULL,
  mime_type      TEXT NOT NULL DEFAULT '',
  size_bytes     BIGINT NOT NULL DEFAULT 0,
  storage_url    TEXT NOT NULL,
  storage_key    TEXT NOT NULL DEFAULT '',
  extracted_text TEXT NOT NULL DEFAULT '',
  notes          TEXT NOT NULL DEFAULT '',
  tags           TEXT[] NOT NULL DEFAULT '{}',
  is_archived    BOOLEAN NOT NULL DEFAULT FALSE,
  upload_date    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Reusable artifacts that can power the presentation system or stand alone in DocBox.
-- A library item may reference an uploaded file, an external visualization, or both.
CREATE TABLE IF NOT EXISTS sv_library_items (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  folder_id           UUID REFERENCES sv_folders(id) ON DELETE SET NULL,
  file_id             UUID REFERENCES sv_files(id) ON DELETE SET NULL,
  title               TEXT NOT NULL,
  kind                TEXT NOT NULL DEFAULT 'document',
  client_name         TEXT NOT NULL DEFAULT '',
  description         TEXT NOT NULL DEFAULT '',
  asset_url           TEXT NOT NULL DEFAULT '',
  thumbnail_url       TEXT NOT NULL DEFAULT '',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  metadata            JSONB NOT NULL DEFAULT '{}'::jsonb,
  presentation_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_favorite         BOOLEAN NOT NULL DEFAULT FALSE,
  is_archived         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS sv_files_folder       ON sv_files(folder_id);
CREATE INDEX IF NOT EXISTS sv_folders_parent     ON sv_folders(parent_id);
CREATE INDEX IF NOT EXISTS sv_files_archived     ON sv_files(is_archived);
CREATE INDEX IF NOT EXISTS sv_files_upload       ON sv_files(upload_date DESC);
CREATE INDEX IF NOT EXISTS sv_files_tags         ON sv_files USING GIN(tags);
CREATE INDEX IF NOT EXISTS sv_library_folder     ON sv_library_items(folder_id);
CREATE INDEX IF NOT EXISTS sv_library_file       ON sv_library_items(file_id);
CREATE INDEX IF NOT EXISTS sv_library_kind       ON sv_library_items(kind);
CREATE INDEX IF NOT EXISTS sv_library_client     ON sv_library_items(client_name);
CREATE INDEX IF NOT EXISTS sv_library_archived   ON sv_library_items(is_archived);
CREATE INDEX IF NOT EXISTS sv_library_created    ON sv_library_items(created_at DESC);
CREATE INDEX IF NOT EXISTS sv_library_tags       ON sv_library_items USING GIN(tags);
