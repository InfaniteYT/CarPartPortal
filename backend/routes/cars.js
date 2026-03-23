const express = require('express');
const db = require('../db');
const authenticate = require('../middleware/authenticate');

const router = express.Router();

// GET /api/cars - get current user's cars
router.get('/', authenticate, (req, res) => {
  const cars = db.prepare('SELECT * FROM cars WHERE user_id = ? ORDER BY created_at DESC').all(req.user.userId);
  res.json(cars);
});

// GET /api/cars/:id
router.get('/:id', authenticate, (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  res.json(car);
});

// POST /api/cars
router.post('/', authenticate, (req, res) => {
  const { year, make, model, trim, engine, notes } = req.body;
  if (!year || !make || !model) {
    return res.status(400).json({ error: 'Year, make and model are required.' });
  }
  const stmt = db.prepare(`
    INSERT INTO cars (user_id, year, make, model, trim, engine, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  const result = stmt.run(req.user.userId, year, make, model, trim || null, engine || null, notes || null);
  const car = db.prepare('SELECT * FROM cars WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(car);
});

// PUT /api/cars/:id
router.put('/:id', authenticate, (req, res) => {
  const { year, make, model, trim, engine, notes } = req.body;
  const car = db.prepare('SELECT * FROM cars WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!car) return res.status(404).json({ error: 'Car not found.' });

  db.prepare(`
    UPDATE cars SET year = ?, make = ?, model = ?, trim = ?, engine = ?, notes = ?
    WHERE id = ? AND user_id = ?
  `).run(
    year || car.year,
    make || car.make,
    model || car.model,
    trim !== undefined ? trim : car.trim,
    engine !== undefined ? engine : car.engine,
    notes !== undefined ? notes : car.notes,
    req.params.id,
    req.user.userId
  );

  const updated = db.prepare('SELECT * FROM cars WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// DELETE /api/cars/:id
router.delete('/:id', authenticate, (req, res) => {
  const car = db.prepare('SELECT * FROM cars WHERE id = ? AND user_id = ?').get(req.params.id, req.user.userId);
  if (!car) return res.status(404).json({ error: 'Car not found.' });
  db.prepare('DELETE FROM cars WHERE id = ?').run(req.params.id);
  res.json({ message: 'Car deleted.' });
});

module.exports = router;
