const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/parts - list parts with optional filters
router.get('/', (req, res) => {
  const { type, category, search, page = 1, limit = 20 } = req.query;
  const conditions = [];
  const params = [];

  if (type && type !== 'all') {
    conditions.push("(type = ? OR type = 'both')");
    params.push(type);
  }
  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (search) {
    conditions.push('(name LIKE ? OR brand LIKE ? OR description LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM parts ${where}`).get(...params).cnt;
  const parts = db.prepare(`SELECT * FROM parts ${where} ORDER BY category, name LIMIT ? OFFSET ?`).all(...params, parseInt(limit), offset);

  res.json({ parts, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/parts/categories - list all unique categories
router.get('/categories', (req, res) => {
  const cats = db.prepare('SELECT DISTINCT category FROM parts ORDER BY category').all();
  res.json(cats.map(c => c.category));
});

// GET /api/parts/:id
router.get('/:id', (req, res) => {
  const part = db.prepare('SELECT * FROM parts WHERE id = ?').get(req.params.id);
  if (!part) return res.status(404).json({ error: 'Part not found.' });
  res.json(part);
});

// POST /api/parts/save - save a part to user's list
router.post('/save', authenticate, (req, res) => {
  const { partId, carId } = req.body;
  if (!partId) return res.status(400).json({ error: 'partId is required.' });
  try {
    db.prepare('INSERT OR REPLACE INTO saved_parts (user_id, part_id, car_id) VALUES (?, ?, ?)').run(req.user.userId, partId, carId || null);
    res.json({ message: 'Part saved.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// DELETE /api/parts/save/:partId - unsave a part
router.delete('/save/:partId', authenticate, (req, res) => {
  db.prepare('DELETE FROM saved_parts WHERE user_id = ? AND part_id = ?').run(req.user.userId, req.params.partId);
  res.json({ message: 'Part unsaved.' });
});

// GET /api/parts/saved/list - get user's saved parts
router.get('/saved/list', authenticate, (req, res) => {
  const parts = db.prepare(`
    SELECT p.*, sp.car_id, sp.created_at as saved_at
    FROM saved_parts sp
    JOIN parts p ON p.id = sp.part_id
    WHERE sp.user_id = ?
    ORDER BY sp.created_at DESC
  `).all(req.user.userId);
  res.json(parts);
});

module.exports = router;
