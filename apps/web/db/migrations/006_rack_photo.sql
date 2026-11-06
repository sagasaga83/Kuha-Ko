-- A thrift piece's cut-out photo for the rack: the garment on a transparent background
-- (PNG or WebP), so it hangs on the rack's wooden hanger. Optional; without it the rack
-- hangs the piece's ordinary photo.

ALTER TABLE products ADD COLUMN IF NOT EXISTS rack_photo_url text;
