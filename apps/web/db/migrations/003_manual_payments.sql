-- Payments are made straight to Kuha Ko's GCash or QR Ph and confirmed by hand
-- in the admin, instead of through PayMongo.
--   pending_payment        → the customer has the order page and 30 minutes to pay
--   awaiting_confirmation  → they sent a reference number; stock stays held until
--                            someone confirms (paid) or rejects (cancelled)

ALTER TABLE orders DROP CONSTRAINT orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status IN (
  'pending_payment', 'awaiting_confirmation', 'paid', 'preparing', 'out_for_delivery', 'delivered', 'cancelled', 'expired'
));

ALTER TABLE orders DROP COLUMN checkout_session_id;
ALTER TABLE orders DROP COLUMN checkout_url;
ALTER TABLE orders DROP COLUMN payment_id;
-- payment_method now holds the customer's choice at checkout: 'gcash' or 'qrph'.
ALTER TABLE orders ADD COLUMN payment_reference text;
ALTER TABLE orders ADD COLUMN reference_at timestamptz;

CREATE INDEX orders_awaiting ON orders (reference_at) WHERE status = 'awaiting_confirmation';

-- Same as before, but an order waiting for confirmation can also be released
-- (when the payment can't be found).
CREATE OR REPLACE FUNCTION release_order(p_order uuid, p_status text) RETURNS boolean
LANGUAGE plpgsql AS $$
BEGIN
  UPDATE orders SET status = p_status, hold_expires_at = NULL, updated_at = now()
    WHERE id = p_order AND status IN ('pending_payment', 'awaiting_confirmation');
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  UPDATE products p SET stock = p.stock + i.q, updated_at = now()
    FROM (SELECT product_id, sum(quantity) AS q FROM order_items WHERE order_id = p_order GROUP BY product_id) i
    WHERE p.id = i.product_id AND p.stock IS NOT NULL;
  RETURN true;
END;
$$;
