-- Orders. Money is whole centavos. An order holds its stock while it waits for
-- payment (hold_expires_at); unpaid holds are released by release_order().

CREATE TABLE orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code                text NOT NULL UNIQUE,
  status              text NOT NULL DEFAULT 'pending_payment'
                      CHECK (status IN ('pending_payment', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'expired')),
  customer_name       text NOT NULL,
  customer_phone      text NOT NULL,
  customer_email      text,
  address             text NOT NULL,
  address_lat         double precision NOT NULL,
  address_lng         double precision NOT NULL,
  address_notes       text NOT NULL DEFAULT '',
  distance_m          integer NOT NULL,
  subtotal            integer NOT NULL CHECK (subtotal >= 0),
  delivery_fee        integer NOT NULL CHECK (delivery_fee >= 0),
  total               integer NOT NULL CHECK (total >= 0),
  checkout_session_id text UNIQUE,
  checkout_url        text,
  payment_id          text,
  payment_method      text,
  -- Set when something needs a person to look at it, e.g. paid after the hold ran out.
  attention           text,
  hold_expires_at     timestamptz,
  paid_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_status_created ON orders (status, created_at DESC);
CREATE INDEX orders_pending_hold ON orders (hold_expires_at) WHERE status = 'pending_payment';

CREATE TABLE order_items (
  id         bigserial PRIMARY KEY,
  order_id   uuid NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id text REFERENCES products (id) ON DELETE SET NULL,
  name       text NOT NULL,
  -- What the customer picked, as shown: [{"group": "Size", "value": "M"}]
  choices    jsonb NOT NULL DEFAULT '[]',
  unit_price integer NOT NULL CHECK (unit_price >= 0),
  quantity   integer NOT NULL CHECK (quantity > 0),
  line_total integer NOT NULL CHECK (line_total >= 0)
);

CREATE INDEX order_items_order ON order_items (order_id);

-- Takes stock for an order's items, all or nothing. Items with no stock limit
-- (stock IS NULL) are skipped. Raises 'out_of_stock:<product id>' if any item
-- doesn't have enough, which rolls back the whole transaction.
CREATE FUNCTION reserve_stock(p_order uuid) RETURNS void
LANGUAGE plpgsql AS $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT product_id, sum(quantity) AS q FROM order_items
    WHERE order_id = p_order AND product_id IS NOT NULL
    GROUP BY product_id ORDER BY product_id
  LOOP
    UPDATE products SET stock = stock - r.q, updated_at = now()
      WHERE id = r.product_id AND stock IS NOT NULL AND stock >= r.q;
    IF NOT FOUND AND EXISTS (SELECT 1 FROM products WHERE id = r.product_id AND stock IS NOT NULL) THEN
      RAISE EXCEPTION 'out_of_stock:%', r.product_id;
    END IF;
  END LOOP;
END;
$$;

-- Moves an unpaid order to 'expired' or 'cancelled' and gives its stock back.
-- Does nothing (returns false) unless the order is still pending, so stock is
-- never returned twice.
CREATE FUNCTION release_order(p_order uuid, p_status text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE orders SET status = p_status, hold_expires_at = NULL, updated_at = now()
    WHERE id = p_order AND status = 'pending_payment';
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  UPDATE products p SET stock = p.stock + i.q, updated_at = now()
    FROM (SELECT product_id, sum(quantity) AS q FROM order_items WHERE order_id = p_order GROUP BY product_id) i
    WHERE p.id = i.product_id AND p.stock IS NOT NULL;
  RETURN true;
END;
$$;
