-- Asnan Dental v2 schema. Fresh database.

CREATE TABLE users (
  id            SERIAL PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'assistant' CHECK (role IN ('admin', 'assistant')),
  display_name  TEXT NOT NULL,
  active        BOOLEAN NOT NULL DEFAULT TRUE,
  token_version INTEGER NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE catalog_items (
  id                SERIAL PRIMARY KEY,
  sku               TEXT NOT NULL UNIQUE,
  name              TEXT NOT NULL,
  category          TEXT NOT NULL,
  category_label    TEXT NOT NULL,
  pkg               TEXT,
  manufacturer      TEXT,
  supplier          TEXT,
  item_number       TEXT,
  photo_url         TEXT,
  on_hand           INTEGER NOT NULL DEFAULT 0,
  reorder_threshold INTEGER NOT NULL DEFAULT 1,
  active            BOOLEAN NOT NULL DEFAULT TRUE,
  sort              INTEGER NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX catalog_items_category_idx ON catalog_items (category);
CREATE INDEX catalog_items_active_idx ON catalog_items (active);

CREATE TABLE orders (
  id             SERIAL PRIMARY KEY,
  kind           TEXT NOT NULL DEFAULT 'supply' CHECK (kind IN ('supply')),
  created_by     INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_by_email TEXT NOT NULL,
  assistant_name TEXT NOT NULL,
  order_date     DATE NOT NULL,
  urgency        TEXT NOT NULL DEFAULT 'Routine' CHECK (urgency IN ('Routine', 'Priority', 'Urgent')),
  notes          TEXT NOT NULL DEFAULT '',
  item_count     INTEGER NOT NULL DEFAULT 0,
  email_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX orders_created_by_idx ON orders (created_by);

CREATE TABLE order_items (
  id           SERIAL PRIMARY KEY,
  order_id     INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  sku          TEXT NOT NULL,
  name         TEXT NOT NULL,
  qty          INTEGER NOT NULL CHECK (qty > 0),
  unit         TEXT,
  manufacturer TEXT,
  supplier     TEXT,
  category     TEXT
);
CREATE INDEX order_items_order_id_idx ON order_items (order_id);
CREATE INDEX order_items_sku_idx ON order_items (sku);

CREATE TABLE order_special_requests (
  id        SERIAL PRIMARY KEY,
  order_id  INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  text      TEXT NOT NULL,
  photo_url TEXT
);
CREATE INDEX order_special_requests_order_id_idx ON order_special_requests (order_id);

CREATE TABLE endo_orders (
  id             SERIAL PRIMARY KEY,
  created_by     INTEGER REFERENCES users (id) ON DELETE SET NULL,
  created_by_email TEXT NOT NULL,
  dentist        TEXT NOT NULL,
  order_date     DATE NOT NULL,
  urgency        TEXT NOT NULL DEFAULT 'Routine' CHECK (urgency IN ('Routine', 'Priority', 'Urgent')),
  payload        JSONB NOT NULL,
  email_sent     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX endo_orders_created_at_idx ON endo_orders (created_at DESC);

CREATE TABLE audit_log (
  id          SERIAL PRIMARY KEY,
  at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actor_id    INTEGER,
  actor_email TEXT NOT NULL,
  action      TEXT NOT NULL,
  entity      TEXT NOT NULL,
  entity_id   TEXT,
  detail      JSONB NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX audit_log_at_idx ON audit_log (at DESC);
CREATE INDEX audit_log_entity_idx ON audit_log (entity, entity_id);
