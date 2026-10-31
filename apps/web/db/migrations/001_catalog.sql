-- The catalog and shop settings. Money is whole centavos.

CREATE TABLE products (
  id          text PRIMARY KEY,
  kind        text NOT NULL CHECK (kind IN ('coffee', 'shirt', 'thrift')),
  category    text NOT NULL DEFAULT '',
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  detail      text NOT NULL DEFAULT '',
  photo_url   text,
  price       integer CHECK (price >= 0),
  options     jsonb NOT NULL DEFAULT '[]',
  stock       integer CHECK (stock >= 0),
  active      boolean NOT NULL DEFAULT true,
  featured    boolean NOT NULL DEFAULT false,
  sort        integer NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_kind_sort ON products (kind, category, sort);

CREATE TABLE settings (
  key        text PRIMARY KEY,
  value      jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);
