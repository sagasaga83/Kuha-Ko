-- Customer accounts. Sign-in itself is Clerk's; this keeps what a signed-in
-- customer fills in at checkout, so it's ready next time, and links their orders.
-- Guest checkout stays: orders.customer_id is NULL for those.

CREATE TABLE customers (
  -- The Clerk user id (user_…).
  id            text PRIMARY KEY,
  name          text NOT NULL DEFAULT '',
  phone         text NOT NULL DEFAULT '',
  email         text NOT NULL DEFAULT '',
  address       text NOT NULL DEFAULT '',
  address_notes text NOT NULL DEFAULT '',
  address_lat   double precision,
  address_lng   double precision,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE orders ADD COLUMN customer_id text REFERENCES customers (id) ON DELETE SET NULL;

CREATE INDEX orders_customer_created ON orders (customer_id, created_at DESC) WHERE customer_id IS NOT NULL;
