const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

const ENCOUNTER_COLS = `
  e.id, e.athlete_id, a.name AS athlete_name,
  e.injury_type, e.body_part,
  e.subjective, e.objective, e.assessment, e.plan,
  e.voice_transcript, e.created_at, e.updated_at,
  a.clearance_status
`;

// GET /api/encounters?athlete_id=X — all encounters owned by this trainer, optionally filtered
router.get('/', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const { athlete_id } = req.query;

  if (athlete_id) {
    const athlete = db.get(
      'SELECT id FROM athletes WHERE id = ? AND trainer_id = ?',
      [athlete_id, req.user.id]
    );
    if (!athlete) return res.status(404).json({ error: 'Athlete not found' });

    return res.json(db.all(
      `SELECT ${ENCOUNTER_COLS}
       FROM encounters e JOIN athletes a ON a.id = e.athlete_id
       WHERE e.athlete_id = ? AND e.trainer_id = ?
       ORDER BY e.created_at DESC`,
      [athlete_id, req.user.id]
    ));
  }

  res.json(db.all(
    `SELECT ${ENCOUNTER_COLS}
     FROM encounters e JOIN athletes a ON a.id = e.athlete_id
     WHERE e.trainer_id = ?
     ORDER BY e.created_at DESC`,
    [req.user.id]
  ));
});

// POST /api/encounters — create encounter
router.post('/', requireRole('trainer', 'admin'), (req, res) => {
  const { athlete_id, injury_type, body_part, subjective, objective, assessment, plan, voice_transcript } = req.body;
  if (!athlete_id) return res.status(400).json({ error: 'athlete_id required' });
  const db = getDb();

  const athlete = db.get(
    'SELECT id FROM athletes WHERE id = ? AND trainer_id = ?',
    [athlete_id, req.user.id]
  );
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });

  const result = db.run(
    `INSERT INTO encounters (athlete_id, trainer_id, injury_type, body_part, subjective, objective, assessment, plan, voice_transcript)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [athlete_id, req.user.id, injury_type || '', body_part || '', subjective || '', objective || '', assessment || '', plan || '', voice_transcript || null]
  );

  res.status(201).json({ id: result.lastInsertRowid });
});

// PATCH /api/encounters/:id — update encounter
router.patch('/:id', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const encounterId = req.params.id;
  const trainerId = req.user.id;

  const encounter = db.get(
    'SELECT id FROM encounters WHERE id = ? AND trainer_id = ?',
    [encounterId, trainerId]
  );

  if (!encounter) return res.status(404).json({ error: 'Encounter not found or unauthorized' });

  const fieldsToUpdate = [];
  const values = [];

  const updatableFields = ['subjective', 'objective', 'assessment', 'plan', 'injury_type', 'body_part'];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      fieldsToUpdate.push(`${field} = ?`);
      values.push(req.body[field]);
    }
  });

  if (fieldsToUpdate.length === 0) {
    return res.status(400).json({ error: 'No valid fields to update' });
  }

  fieldsToUpdate.push(`updated_at = datetime('now')`);
  values.push(encounterId, trainerId);

  db.run(
    `UPDATE encounters SET ${fieldsToUpdate.join(', ')} WHERE id = ? AND trainer_id = ?`,
    values
  );

  const updatedEncounter = db.get(
    `SELECT ${ENCOUNTER_COLS}
     FROM encounters e JOIN athletes a ON a.id = e.athlete_id
     WHERE e.id = ? AND e.trainer_id = ?`,
    [encounterId, trainerId]
  );

  res.json(updatedEncounter);
});

module.exports = router;
