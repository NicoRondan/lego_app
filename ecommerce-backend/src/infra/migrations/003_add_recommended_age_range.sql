-- Add recommended age range columns to products
ALTER TABLE products ADD COLUMN recommended_age_min INTEGER;
ALTER TABLE products ADD COLUMN recommended_age_max INTEGER;
