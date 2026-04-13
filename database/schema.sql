-- Schema for inventory.db (auto-created by backend/db.js but manual init if needed)
CREATE TABLE IF NOT EXISTS items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  price REAL DEFAULT 0.0,
  category TEXT DEFAULT 'General',
  description TEXT DEFAULT '',
  location TEXT DEFAULT 'Warehouse',
  last_updated TEXT DEFAULT ''
);

CREATE VIEW IF NOT EXISTS item_values AS
SELECT
  id,
  name,
  category,
  quantity,
  price,
  quantity * price AS value,
  location,
  description,
  last_updated
FROM items;

-- Sample data
INSERT OR IGNORE INTO items (name, quantity, price, category, description, location, last_updated) VALUES
('Laptop', 10, 999.99, 'Electronics', 'Premium workstation laptop', 'Main Warehouse', datetime('now')),
('Mouse', 50, 19.99, 'Electronics', 'Wireless ergonomic mouse', 'Main Warehouse', datetime('now')),
('Keyboard', 5, 49.99, 'Electronics', 'Mechanical keyboard', 'Main Warehouse', datetime('now'));

