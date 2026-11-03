-- More photos per product (close-ups, the back, any flaw), and the list of
-- people who asked to hear when the next live selling starts.

ALTER TABLE products ADD COLUMN gallery jsonb NOT NULL DEFAULT '[]';

CREATE TABLE signups (
  email      text PRIMARY KEY,
  -- Where they signed up: 'live' (the live selling page) or 'footer'.
  source     text NOT NULL DEFAULT 'live',
  created_at timestamptz NOT NULL DEFAULT now()
);
