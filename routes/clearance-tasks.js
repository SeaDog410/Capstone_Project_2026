const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET all clearance tasks for authenticated trainer (pending + completed in last 7 days)
router.get('/', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const tasks = db.all(`
    SELECT ct.id, ct.athlete_id, a.name AS athlete_name, ct.note, ct.status, ct.created_at, ct.updated_at
    FROM clearance_tasks ct
    JOIN athletes a ON a.id = ct.athlete_id
    WHERE ct.trainer_id = ?
      AND (ct.status = 'pending' OR (ct.status = 'done' AND ct.updated_at >= datetime('now', '-7 days')))
    ORDER BY ct.created_at DESC
  `, [req.user.id]);
  
  res.json(tasks);
});

// POST a new clearance task
router.post('/', requireRole('trainer'), (req, res) => {
  const { athlete_id, note } = req.body;
  if (!athlete_id || !note) {
    return res.status(400).json({ error: 'athlete_id and note are required' });
  }

  const db = getDb();
  
  // Verify athlete belongs to trainer
  const athlete = db.get('SELECT id FROM athletes WHERE id = ? AND trainer_id = ?', [athlete_id, req.user.id]);
  if (!athlete) {
    return res.status(403).json({ error: 'Not authorized to assign tasks for this athlete' });
  }

  const stmt = db.prepare('INSERT INTO clearance_tasks (trainer_id, athlete_id, note, status, created_at, updated_at) VALUES (?, ?, ?, ?, datetime("now"), datetime("now"))');
  const info = stmt.run([req.user.id, athlete_id, note, 'pending']);

  res.status(201).json({ id: info.lastInsertRowid });
});

// PATCH a clearance task (mark done)
router.patch('/:id', requireRole('trainer'), (req, res) => {
  const taskId = req.params.id;
  const db = getDb();

  // Verify task belongs to trainer
  const task = db.get('SELECT id, status FROM clearance_tasks WHERE id = ? AND trainer_id = ?', [taskId, req.user.id]);
  if (!task) {
    return res.status(403).json({ error: 'Not authorized or task not found' });
  }

  const stmt = db.prepare('UPDATE clearance_tasks SET status = ?, updated_at = datetime("now") WHERE id = ?');
  stmt.run(['done', taskId]);

  res.json({ success: true });
});

module.exports = router;
