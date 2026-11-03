-- People who asked to hear when the next live selling starts.

CREATE TABLE signups (
  email      text PRIMARY KEY,
  -- Where they signed up: 'live' (the live selling page) or 'footer'.
  source     text NOT NULL DEFAULT 'live',
  created_at timestamptz NOT NULL DEFAULT now()
);
