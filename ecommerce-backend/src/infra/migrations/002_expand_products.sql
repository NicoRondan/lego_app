-- Expand products with additional metadata and supporting tables
-- Identity fields
ALTER TABLE products ADD COLUMN slug TEXT;
ALTER TABLE products ADD COLUMN set_number TEXT;

-- Ensure uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_set_number ON products(set_number);

-- Construction fields
ALTER TABLE products ADD COLUMN piece_count INTEGER DEFAULT 0;
ALTER TABLE products ADD COLUMN minifig_count INTEGER DEFAULT 0;

-- Logistics fields
ALTER TABLE products ADD COLUMN weight_grams INTEGER;
ALTER TABLE products ADD COLUMN box_width_mm INTEGER;
ALTER TABLE products ADD COLUMN box_height_mm INTEGER;
ALTER TABLE products ADD COLUMN box_depth_mm INTEGER;

-- Commercial fields
ALTER TABLE products ADD COLUMN release_year INTEGER;
ALTER TABLE products ADD COLUMN retired_year INTEGER;

-- Pricing field
ALTER TABLE products ADD COLUMN msrp REAL;

-- Media fields
ALTER TABLE products ADD COLUMN instructions_url TEXT;

-- Product media table
CREATE TABLE IF NOT EXISTS product_media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  type TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_media_product_id ON product_media(product_id);

-- Product price history table
CREATE TABLE IF NOT EXISTS product_price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
  price REAL NOT NULL,
  recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_product_price_history_product_id ON product_price_history(product_id);
CREATE INDEX IF NOT EXISTS idx_product_price_history_recorded_at ON product_price_history(recorded_at);
