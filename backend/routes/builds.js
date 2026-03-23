const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/builds - list build ideas
router.get('/', (req, res) => {
  const { category, difficulty, search, make, page = 1, limit = 12 } = req.query;
  const conditions = [];
  const params = [];

  if (category && category !== 'all') {
    conditions.push('category = ?');
    params.push(category);
  }
  if (difficulty && difficulty !== 'all') {
    conditions.push('difficulty = ?');
    params.push(difficulty);
  }
  if (make && make !== 'all') {
    conditions.push('(car_make = ? OR car_make IS NULL)');
    params.push(make);
  }
  if (search) {
    conditions.push('(title LIKE ? OR description LIKE ? OR car_make LIKE ? OR car_model LIKE ?)');
    const s = `%${search}%`;
    params.push(s, s, s, s);
  }

  const where = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (parseInt(page) - 1) * parseInt(limit);

  const total = db.prepare(`SELECT COUNT(*) as cnt FROM build_ideas ${where}`).get(...params).cnt;
  const builds = db.prepare(`
    SELECT bi.*, u.username as author
    FROM build_ideas bi
    LEFT JOIN users u ON u.id = bi.user_id
    ${where}
    ORDER BY bi.likes DESC, bi.created_at DESC
    LIMIT ? OFFSET ?
  `).all(...params, parseInt(limit), offset);

  res.json({ builds, total, page: parseInt(page), limit: parseInt(limit) });
});

// GET /api/builds/:id
router.get('/:id', (req, res) => {
  const build = db.prepare(`
    SELECT bi.*, u.username as author
    FROM build_ideas bi
    LEFT JOIN users u ON u.id = bi.user_id
    WHERE bi.id = ?
  `).get(req.params.id);
  if (!build) return res.status(404).json({ error: 'Build idea not found.' });
  res.json(build);
});

// POST /api/builds - create a build idea (authenticated)
router.post('/', authenticate, (req, res) => {
  const { title, description, car_make, car_model, car_year_min, car_year_max, category, difficulty, estimated_cost } = req.body;
  if (!title || !description || !category) {
    return res.status(400).json({ error: 'Title, description and category are required.' });
  }
  const result = db.prepare(`
    INSERT INTO build_ideas (user_id, title, description, car_make, car_model, car_year_min, car_year_max, category, difficulty, estimated_cost)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    req.user.userId, title, description,
    car_make || null, car_model || null,
    car_year_min || null, car_year_max || null,
    category, difficulty || null, estimated_cost || null
  );
  const build = db.prepare('SELECT * FROM build_ideas WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(build);
});

// POST /api/builds/:id/like
router.post('/:id/like', (req, res) => {
  const build = db.prepare('SELECT * FROM build_ideas WHERE id = ?').get(req.params.id);
  if (!build) return res.status(404).json({ error: 'Build idea not found.' });
  db.prepare('UPDATE build_ideas SET likes = likes + 1 WHERE id = ?').run(req.params.id);
  res.json({ likes: build.likes + 1 });
});

// GET /api/builds/categories/list
router.get('/categories/list', (req, res) => {
  const cats = db.prepare('SELECT DISTINCT category FROM build_ideas ORDER BY category').all();
  res.json(cats.map(c => c.category));
});

module.exports = router;
