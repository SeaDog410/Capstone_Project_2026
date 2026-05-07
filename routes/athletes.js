const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/athletes — trainer sees their athletes
router.get('/', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const athletes = db.all(
    'SELECT id, name, team, clearance_status FROM athletes WHERE trainer_id = ? ORDER BY name',
    [req.user.id]
  );
  res.json(athletes);
});

// GET /api/athletes/roster — coach sees all athletes (name, team, clearance only)
router.get('/roster', requireRole('coach', 'admin'), (req, res) => {
  const db = getDb();
  const athletes = db.all(
    'SELECT name, team, clearance_status FROM athletes ORDER BY name'
  );
  res.json(athletes);
});

// GET /api/athletes/me — athlete sees their own profile
router.get('/me', requireRole('athlete'), (req, res) => {
  const db = getDb();
  const athlete = db.get(
    'SELECT id, name, team, clearance_status FROM athletes WHERE user_id = ?',
    [req.user.id]
  );
  if (!athlete) return res.status(404).json({ error: 'No athlete profile found' });
  res.json(athlete);
});

// POST /api/athletes — trainer creates athlete, optionally linked to an athlete user by email
router.post('/', requireRole('trainer', 'admin'), (req, res) => {
  const { name, team, email } = req.body;
  if (!name || !team) return res.status(400).json({ error: 'name and team required' });
  const db = getDb();

  let userId = null;
  if (email) {
    const user = db.get('SELECT id, role FROM users WHERE email = ?', [email]);
    if (!user) return res.status(404).json({ error: 'No user found with that email' });
    if (user.role !== 'athlete') return res.status(400).json({ error: 'That user is not an athlete' });
    const existing = db.get('SELECT id FROM athletes WHERE user_id = ?', [user.id]);
    if (existing) return res.status(409).json({ error: 'That athlete already has a profile' });
    userId = user.id;
  }

  const result = db.run(
    'INSERT INTO athletes (name, team, trainer_id, user_id) VALUES (?, ?, ?, ?)',
    [name, team, req.user.id, userId]
  );
  res.status(201).json({ id: result.lastInsertRowid, name, team, clearance_status: 'green' });
});

// PATCH /api/athletes/:id/clearance — trainer updates clearance
router.patch('/:id/clearance', requireRole('trainer', 'admin'), (req, res) => {
  const { status } = req.body;
  if (!['red', 'yellow', 'green'].includes(status)) {
    return res.status(400).json({ error: 'status must be red, yellow, or green' });
  }
  const db = getDb();
  const athlete = db.get(
    'SELECT id FROM athletes WHERE id = ? AND trainer_id = ?',
    [req.params.id, req.user.id]
  );
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
  db.run(
    "UPDATE athletes SET clearance_status = ?, updated_at = datetime('now') WHERE id = ?",
    [status, req.params.id]
  );
  res.json({ success: true });
});

// GET /api/athletes/:id — fetch full athlete profile
router.get('/:id', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const athlete = db.get(
    'SELECT * FROM athletes WHERE id = ? AND trainer_id = ?',
    [req.params.id, req.user.id]
  );
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
  res.json(athlete);
});

// PATCH /api/athletes/:id — trainer updates athlete profile
router.patch('/:id', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const athlete = db.get(
    'SELECT id FROM athletes WHERE id = ? AND trainer_id = ?',
    [req.params.id, req.user.id]
  );
  if (!athlete) return res.status(403).json({ error: 'Athlete not found or not assigned to you' });

  const allowedFields = [
    'name', 'team', 'age', 'height', 'weight', 'year', 'phone',
    'emergency_contact_name', 'emergency_contact_phone', 'insurance',
    'blood_type', 'allergies', 'medications', 'medical_history',
    'last_physical', 'primary_physician', 'injury_type', 'body_part'
  ];

  const updates = [];
  const params = [];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updates.push(`${field} = ?`);
      params.push(req.body[field]);
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields provided' });

  updates.push("updated_at = datetime('now')");
  params.push(req.params.id);

  db.run(`UPDATE athletes SET ${updates.join(', ')} WHERE id = ?`, params);

  const updatedAthlete = db.get('SELECT * FROM athletes WHERE id = ?', [req.params.id]);
  res.json(updatedAthlete);
});

module.exports = router;
