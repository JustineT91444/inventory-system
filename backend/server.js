const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*',
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

function broadcastChange() {
  io.emit('itemUpdate');
}

function buildItemsQuery({ search, category, sort }) {
  const filters = [];
  const params = [];
  if (search) {
    filters.push('LOWER(name) LIKE ?');
    params.push(`%${search.toLowerCase()}%`);
  }
  if (category && category !== 'All') {
    filters.push('category = ?');
    params.push(category);
  }
  let query = 'SELECT * FROM items';
  if (filters.length) query += ' WHERE ' + filters.join(' AND ');

  switch (sort) {
    case 'value_asc':
      query += ' ORDER BY quantity * price ASC';
      break;
    case 'value_desc':
      query += ' ORDER BY quantity * price DESC';
      break;
    case 'qty_asc':
      query += ' ORDER BY quantity ASC';
      break;
    case 'qty_desc':
      query += ' ORDER BY quantity DESC';
      break;
    case 'name_desc':
      query += ' ORDER BY name COLLATE NOCASE DESC';
      break;
    default:
      query += ' ORDER BY name COLLATE NOCASE ASC';
  }

  return { query, params };
}

// GET /api/items
app.get('/api/items', (req, res) => {
  const { search = '', category = 'All', sort = 'name_asc' } = req.query;
  const { query, params } = buildItemsQuery({ search, category, sort });
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows);
  });
});

// GET /api/categories
app.get('/api/categories', (req, res) => {
  db.all('SELECT DISTINCT category FROM items ORDER BY category COLLATE NOCASE', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(rows.map((row) => row.category));
  });
});

// GET /api/summary
app.get('/api/summary', (req, res) => {
  const summaryQuery = `
    SELECT
      COUNT(*) as totalItems,
      SUM(quantity) as totalQuantity,
      SUM(quantity * price) as totalValue,
      SUM(CASE WHEN quantity < 10 THEN 1 ELSE 0 END) as lowStock
    FROM items
  `;
  const categoriesQuery = 'SELECT category, COUNT(*) as count FROM items GROUP BY category ORDER BY count DESC';

  db.get(summaryQuery, (err, summary) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.all(categoriesQuery, (catErr, categories) => {
      if (catErr) {
        return res.status(500).json({ error: catErr.message });
      }
      res.json({
        totalItems: summary.totalItems || 0,
        totalQuantity: summary.totalQuantity || 0,
        totalValue: Number(summary.totalValue || 0).toFixed(2),
        lowStock: summary.lowStock || 0,
        categories: categories || []
      });
    });
  });
});

// GET /api/analytics
app.get('/api/analytics', (req, res) => {
  const categoryValueQuery = `
    SELECT category,
      SUM(quantity * price) as totalValue,
      SUM(quantity) as totalQuantity
    FROM items
    GROUP BY category
    ORDER BY totalValue DESC
  `;
  const topItemsQuery = `
    SELECT id, name, category, quantity, price, location, description,
      quantity * price AS value
    FROM items
    ORDER BY value DESC
    LIMIT 8
  `;

  db.all(categoryValueQuery, (err, categoryRows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    db.all(topItemsQuery, (topErr, topRows) => {
      if (topErr) {
        return res.status(500).json({ error: topErr.message });
      }
      res.json({
        categoryValues: categoryRows.map((row) => ({
          category: row.category || 'General',
          value: Number(row.totalValue || 0),
          quantity: row.totalQuantity || 0
        })),
        topItems: topRows.map((row) => ({
          id: row.id,
          name: row.name,
          category: row.category,
          quantity: row.quantity,
          price: row.price,
          location: row.location,
          description: row.description,
          value: Number(row.value || 0)
        }))
      });
    });
  });
});

// POST /api/items
app.post('/api/items', (req, res) => {
  const { name, quantity, price, category = 'General', description = '', location = 'Warehouse' } = req.body;
  db.run(
    'INSERT INTO items (name, quantity, price, category, description, location, last_updated) VALUES (?, ?, ?, ?, ?, ?, datetime("now"))',
    [name, quantity, price, category, description, location],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      broadcastChange();
      res.json({ id: this.lastID });
    }
  );
});

// PUT /api/items/:id
app.put('/api/items/:id', (req, res) => {
  const { name, quantity, price, category = 'General', description = '', location = 'Warehouse' } = req.body;
  const id = req.params.id;
  db.run(
    'UPDATE items SET name = ?, quantity = ?, price = ?, category = ?, description = ?, location = ?, last_updated = datetime("now") WHERE id = ?',
    [name, quantity, price, category, description, location, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes > 0) broadcastChange();
      res.json({ affected: this.changes });
    }
  );
});

// PATCH /api/items/:id/stock
app.patch('/api/items/:id/stock', (req, res) => {
  const { adjustment } = req.body;
  const id = req.params.id;
  if (typeof adjustment !== 'number') {
    return res.status(400).json({ error: 'Adjustment must be a number' });
  }
  db.run(
    'UPDATE items SET quantity = MAX(quantity + ?, 0), last_updated = datetime("now") WHERE id = ?',
    [adjustment, id],
    function(err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes > 0) broadcastChange();
      res.json({ affected: this.changes });
    }
  );
});

// DELETE /api/items/:id
app.delete('/api/items/:id', (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM items WHERE id = ?', [id], function(err) {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (this.changes > 0) broadcastChange();
    res.json({ affected: this.changes });
  });
});

// GET /api/alerts - low stock
app.get('/api/alerts', (req, res) => {
  const threshold = parseInt(req.query.threshold, 10) || 10;
  db.all('SELECT * FROM items WHERE quantity < ?', [threshold], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    console.log('Low stock alerts:', rows);
    res.json(rows);
  });
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

