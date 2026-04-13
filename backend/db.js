const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database/inventory.db');
const db = new sqlite3.Database(dbPath);

const sampleItems = [
  {
    name: 'Dell XPS 15 Laptop',
    quantity: 32,
    price: 1849.0,
    category: 'Electronics',
    description: 'Premium mobile workstation with OLED display.',
    location: 'Main Warehouse'
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    quantity: 48,
    price: 349.99,
    category: 'Electronics',
    description: 'Industry-leading noise cancellation.',
    location: 'Audio Rack'
  },
  {
    name: 'Apple iPad Pro 12.9"',
    quantity: 22,
    price: 1099.0,
    category: 'Electronics',
    description: 'High-performance tablet for creative professionals.',
    location: 'Electronics Bin'
  },
  {
    name: 'Samsung 32" Curved Monitor',
    quantity: 18,
    price: 529.99,
    category: 'Electronics',
    description: 'Ultra-wide display for immersive workstations.',
    location: 'Display Room'
  },
  {
    name: 'Logitech MX Master 3',
    quantity: 63,
    price: 99.99,
    category: 'Electronics',
    description: 'Precision wireless mouse for power users.',
    location: 'Main Warehouse'
  },
  {
    name: 'Amazon Echo Show 8',
    quantity: 28,
    price: 129.99,
    category: 'Electronics',
    description: 'Smart display with Alexa voice control.',
    location: 'Electronics Bin'
  },
  {
    name: 'Nike Air Zoom Pegasus',
    quantity: 56,
    price: 119.99,
    category: 'Clothing',
    description: 'Comfortable running shoe with responsive cushioning.',
    location: 'Backroom'
  },
  {
    name: 'Levi’s 501 Original Jeans',
    quantity: 44,
    price: 69.99,
    category: 'Clothing',
    description: 'Classic straight-leg denim jean.',
    location: 'Backroom'
  },
  {
    name: 'Patagonia Better Sweater',
    quantity: 27,
    price: 139.0,
    category: 'Clothing',
    description: 'Warm fleece jacket built for sustainability.',
    location: 'Seasonal Stock'
  },
  {
    name: 'Ray-Ban Aviator Sunglasses',
    quantity: 19,
    price: 154.0,
    category: 'Clothing',
    description: 'Iconic sunglasses with polarized lenses.',
    location: 'Backroom'
  },
  {
    name: 'Lululemon Align Leggings',
    quantity: 35,
    price: 98.0,
    category: 'Clothing',
    description: 'Soft, high-waisted leggings for everyday wear.',
    location: 'Backroom'
  },
  {
    name: 'The Innovator’s Dilemma',
    quantity: 74,
    price: 26.99,
    category: 'Books',
    description: 'Classic business strategy text.',
    location: 'Book Aisle'
  },
  {
    name: 'Atomic Habits',
    quantity: 88,
    price: 22.0,
    category: 'Books',
    description: 'Practical guide to habit-building.',
    location: 'Book Aisle'
  },
  {
    name: 'Clean Code',
    quantity: 40,
    price: 33.99,
    category: 'Books',
    description: 'A handbook of agile software craftsmanship.',
    location: 'Book Aisle'
  },
  {
    name: 'The Psychology of Money',
    quantity: 63,
    price: 24.99,
    category: 'Books',
    description: 'Insights on wealth, greed, and happiness.',
    location: 'Book Aisle'
  },
  {
    name: 'Sapiens: A Brief History of Humankind',
    quantity: 51,
    price: 28.0,
    category: 'Books',
    description: 'A sweeping exploration of human history.',
    location: 'Book Aisle'
  },
  {
    name: 'Herman Miller Aeron Chair',
    quantity: 9,
    price: 1295.0,
    category: 'Furniture',
    description: 'Ergonomic chair designed for all-day comfort.',
    location: 'Furniture Rack'
  },
  {
    name: 'West Elm Solid Wood Desk',
    quantity: 7,
    price: 699.0,
    category: 'Furniture',
    description: 'Modern desk with premium walnut finish.',
    location: 'Furniture Rack'
  },
  {
    name: 'Ikea Stockholm Coffee Table',
    quantity: 21,
    price: 249.0,
    category: 'Furniture',
    description: 'Stylish coffee table in oak veneer.',
    location: 'Showroom'
  },
  {
    name: 'Casper Original Mattress',
    quantity: 12,
    price: 1095.0,
    category: 'Furniture',
    description: 'Responsive foam mattress with cooling gel.',
    location: 'Showroom'
  },
  {
    name: 'Philips Hue Smart Bulb Kit',
    quantity: 36,
    price: 179.99,
    category: 'Electronics',
    description: 'Connected lighting system with color control.',
    location: 'Home Tech'
  },
  {
    name: 'Nespresso Vertuo Machine',
    quantity: 17,
    price: 249.99,
    category: 'Electronics',
    description: 'Premium single-serve espresso system.',
    location: 'Kitchen Gear'
  },
  {
    name: 'Williams Sonoma Knife Set',
    quantity: 26,
    price: 299.99,
    category: 'Kitchen',
    description: 'Professional stainless steel knife collection.',
    location: 'Kitchen Gear'
  },
  {
    name: 'Bose SoundLink Revolve',
    quantity: 33,
    price: 219.0,
    category: 'Electronics',
    description: 'Portable Bluetooth speaker with 360° sound.',
    location: 'Audio Rack'
  },
  {
    name: 'Organic Cold Brew Coffee',
    quantity: 145,
    price: 14.99,
    category: 'Food',
    description: 'Smooth, ready-to-drink cold brew.',
    location: 'Cold Storage'
  },
  {
    name: 'Artisan Sourdough Bread',
    quantity: 96,
    price: 7.99,
    category: 'Food',
    description: 'Fresh bakery-style sourdough loaf.',
    location: 'Cold Storage'
  },
  {
    name: 'Montebianco Extra Virgin Olive Oil',
    quantity: 78,
    price: 18.99,
    category: 'Food',
    description: 'Cold-pressed premium olive oil.',
    location: 'Dry Storage'
  },
  {
    name: 'La Colombe Coffee Beans',
    quantity: 88,
    price: 16.99,
    category: 'Food',
    description: 'Roasted whole bean coffee blend.',
    location: 'Dry Storage'
  },
  {
    name: 'Organic Greek Yogurt 32oz',
    quantity: 54,
    price: 6.49,
    category: 'Food',
    description: 'Rich strained yogurt with live cultures.',
    location: 'Cold Storage'
  },
  {
    name: 'Sonos Arc Soundbar',
    quantity: 11,
    price: 899.0,
    category: 'Electronics',
    description: 'High-end soundbar with Dolby Atmos.',
    location: 'Audio Rack'
  },
  {
    name: 'Apple Watch Series 9',
    quantity: 14,
    price: 429.0,
    category: 'Electronics',
    description: 'Smartwatch with fitness and productivity tools.',
    location: 'Electronics Bin'
  },
  {
    name: 'Bonobos Stretch Chinos',
    quantity: 42,
    price: 89.0,
    category: 'Clothing',
    description: 'Comfortable slim-fit cotton chinos.',
    location: 'Backroom'
  },
  {
    name: 'Allbirds Wool Runners',
    quantity: 29,
    price: 125.0,
    category: 'Clothing',
    description: 'Lightweight sustainable sneakers.',
    location: 'Backroom'
  }
];

const requiredColumns = [
  { name: 'category', sql: "TEXT DEFAULT 'General'" },
  { name: 'description', sql: "TEXT DEFAULT ''" },
  { name: 'location', sql: "TEXT DEFAULT 'Warehouse'" },
  { name: 'last_updated', sql: "TEXT DEFAULT ''" }
];

function ensureColumns() {
  db.all('PRAGMA table_info(items)', (err, rows) => {
    if (err || !rows) return;
    const existing = rows.map((row) => row.name);
    requiredColumns.forEach((column) => {
      if (!existing.includes(column.name)) {
        db.run(`ALTER TABLE items ADD COLUMN ${column.name} ${column.sql}`);
      }
    });
  });
}

function looksLikeOldSeed(item) {
  return /^\w+\s+\w+\s+#\d+$/.test(item.name) && item.category === 'General';
}

function createSampleItems() {
  db.get('SELECT COUNT(*) as count FROM items', (err, row) => {
    if (err || !row) return;

    db.all('SELECT name, category FROM items LIMIT 200', (fetchErr, rows) => {
      if (fetchErr) return;
      const badCount = rows.filter(looksLikeOldSeed).length;
      const badRatio = rows.length ? badCount / rows.length : 0;
      const shouldReset = row.count === 0 || badRatio > 0.65;

      if (!shouldReset) {
        console.log('Existing inventory detected, not overwriting current data.');
        return;
      }

      db.serialize(() => {
        db.run('DELETE FROM items');
        const stmt = db.prepare(
          'INSERT INTO items (name, quantity, price, category, description, location, last_updated) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))'
        );
        sampleItems.forEach((item) => {
          stmt.run(item.name, item.quantity, item.price, item.category, item.description, item.location);
        });
        stmt.finalize(() => {
          console.log('Repopulated inventory with clean premium items.');
        });
      });
    });
  });
}

function initializeDatabase() {
  db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      quantity INTEGER DEFAULT 0,
      price REAL DEFAULT 0.0,
      category TEXT DEFAULT 'General',
      description TEXT DEFAULT '',
      location TEXT DEFAULT 'Warehouse',
      last_updated TEXT DEFAULT ''
    )`);
    ensureColumns();
    createSampleItems();
  });
}

initializeDatabase();

module.exports = db;

