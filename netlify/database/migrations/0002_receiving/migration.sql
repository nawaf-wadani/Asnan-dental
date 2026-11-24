-- Receiving: record how much of each ordered line has arrived, so the Inventory
-- page can add received items to stock and show what is still on order.

ALTER TABLE order_items ADD COLUMN received_qty INTEGER NOT NULL DEFAULT 0 CHECK (received_qty >= 0);
ALTER TABLE order_items ADD COLUMN received_at  TIMESTAMPTZ;
ALTER TABLE order_items ADD COLUMN received_by  TEXT;

-- Set when every line of the order has been received in full.
ALTER TABLE orders ADD COLUMN received_at TIMESTAMPTZ;

CREATE INDEX order_items_open_idx ON order_items (order_id) WHERE received_qty < qty;
