ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS city VARCHAR(120);
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS locality VARCHAR(160);

CREATE INDEX IF NOT EXISTS idx_city ON restaurants(city);
CREATE INDEX IF NOT EXISTS idx_locality ON restaurants(locality);
