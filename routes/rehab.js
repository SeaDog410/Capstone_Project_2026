const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/rehab/library
router.get('/library', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const exercises = db.all('SELECT id, name, category FROM exercise_library ORDER BY category, name');
  res.json(exercises);
});

// GET /api/rehab/programs — trainer sees their programs with athlete info
router.get('/programs', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const programs = db.all(`
    SELECT rp.id, rp.name, rp.athlete_id, rp.created_at,
           a.name AS athlete_name, a.team,
           COUNT(re.id) AS exercise_count
    FROM rehab_programs rp
    JOIN athletes a ON a.id = rp.athlete_id
    LEFT JOIN rehab_exercises re ON re.program_id = rp.id
    WHERE rp.trainer_id = ?
    GROUP BY rp.id
    ORDER BY rp.created_at DESC
  `, [req.user.id]);
  res.json(programs);
});

// POST /api/rehab/programs — trainer creates a program
router.post('/programs', requireRole('trainer', 'admin'), (req, res) => {
  const { athlete_id, name } = req.body;
  if (!athlete_id || !name) return res.status(400).json({ error: 'athlete_id and name required' });
  const db = getDb();
  const athlete = db.get('SELECT id FROM athletes WHERE id = ? AND trainer_id = ?', [athlete_id, req.user.id]);
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
  const result = db.run(
    'INSERT INTO rehab_programs (athlete_id, trainer_id, name) VALUES (?, ?, ?)',
    [athlete_id, req.user.id, name]
  );
  res.status(201).json({ id: result.lastInsertRowid, athlete_id, name, exercise_count: 0 });
});

// GET /api/rehab/programs/:id — program detail with exercises
router.get('/programs/:id', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const program = db.get(`
    SELECT rp.id, rp.name, rp.athlete_id, rp.created_at,
           a.name AS athlete_name, a.team
    FROM rehab_programs rp
    JOIN athletes a ON a.id = rp.athlete_id
    WHERE rp.id = ? AND rp.trainer_id = ?
  `, [req.params.id, req.user.id]);
  if (!program) return res.status(404).json({ error: 'Program not found' });
  const exercises = db.all(
    'SELECT id, exercise_name, sets, reps, frequency, sort_order FROM rehab_exercises WHERE program_id = ? ORDER BY sort_order, id',
    [req.params.id]
  );
  res.json({ ...program, exercises });
});

// POST /api/rehab/programs/:id/exercises — add exercise to program
router.post('/programs/:id/exercises', requireRole('trainer', 'admin'), (req, res) => {
  const { exercise_name, sets, reps, frequency } = req.body;
  if (!exercise_name || !sets || !reps || !frequency) {
    return res.status(400).json({ error: 'exercise_name, sets, reps, frequency required' });
  }
  const db = getDb();
  const program = db.get('SELECT id FROM rehab_programs WHERE id = ? AND trainer_id = ?', [req.params.id, req.user.id]);
  if (!program) return res.status(404).json({ error: 'Program not found' });
  const result = db.run(
    'INSERT INTO rehab_exercises (program_id, exercise_name, sets, reps, frequency) VALUES (?, ?, ?, ?, ?)',
    [req.params.id, exercise_name, parseInt(sets), parseInt(reps), frequency]
  );
  res.status(201).json({ id: result.lastInsertRowid, exercise_name, sets: parseInt(sets), reps: parseInt(reps), frequency });
});

// DELETE /api/rehab/programs/:id/exercises/:exId
router.delete('/programs/:id/exercises/:exId', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const program = db.get('SELECT id FROM rehab_programs WHERE id = ? AND trainer_id = ?', [req.params.id, req.user.id]);
  if (!program) return res.status(404).json({ error: 'Program not found' });
  db.run('DELETE FROM rehab_completions WHERE exercise_id = ?', [req.params.exId]);
  db.run('DELETE FROM rehab_exercises WHERE id = ? AND program_id = ?', [req.params.exId, req.params.id]);
  res.json({ success: true });
});

// GET /api/rehab/hep — athlete sees their program + today's completions
router.get('/hep', requireRole('athlete'), (req, res) => {
  const db = getDb();
  const athlete = db.get('SELECT id FROM athletes WHERE user_id = ?', [req.user.id]);
  if (!athlete) return res.status(404).json({ error: 'No athlete profile found' });

  const today = new Date().toISOString().slice(0, 10);

  const programs = db.all(
    'SELECT id, name FROM rehab_programs WHERE athlete_id = ? ORDER BY created_at DESC',
    [athlete.id]
  );
  if (!programs.length) return res.json({ programs: [], exercises: [], completions: [], today });

  const programIds = programs.map(p => p.id);
  const placeholders = programIds.map(() => '?').join(',');
  const exercises = db.all(
    `SELECT id, program_id, exercise_name, sets, reps, frequency FROM rehab_exercises WHERE program_id IN (${placeholders}) ORDER BY sort_order, id`,
    programIds
  );

  let completions = [];
  if (exercises.length) {
    const exerciseIds = exercises.map(e => e.id);
    const exPlaceholders = exerciseIds.map(() => '?').join(',');
    const rows = db.all(
      `SELECT exercise_id FROM rehab_completions WHERE athlete_id = ? AND completed_date = ? AND exercise_id IN (${exPlaceholders})`,
      [athlete.id, today, ...exerciseIds]
    );
    completions = rows.map(r => r.exercise_id);
  }

  res.json({ programs, exercises, completions, today });
});

// POST /api/rehab/completions — athlete checks off an exercise
router.post('/completions', requireRole('athlete'), (req, res) => {
  const { exercise_id } = req.body;
  if (!exercise_id) return res.status(400).json({ error: 'exercise_id required' });
  const db = getDb();
  const athlete = db.get('SELECT id FROM athletes WHERE user_id = ?', [req.user.id]);
  if (!athlete) return res.status(404).json({ error: 'No athlete profile found' });
  const exercise = db.get(`
    SELECT re.id FROM rehab_exercises re
    JOIN rehab_programs rp ON rp.id = re.program_id
    WHERE re.id = ? AND rp.athlete_id = ?
  `, [exercise_id, athlete.id]);
  if (!exercise) return res.status(404).json({ error: 'Exercise not found' });
  const today = new Date().toISOString().slice(0, 10);
  db.run(
    'INSERT OR IGNORE INTO rehab_completions (exercise_id, athlete_id, completed_date) VALUES (?, ?, ?)',
    [exercise_id, athlete.id, today]
  );
  res.json({ success: true });
});

// DELETE /api/rehab/completions/:exerciseId — athlete unchecks
router.delete('/completions/:exerciseId', requireRole('athlete'), (req, res) => {
  const db = getDb();
  const athlete = db.get('SELECT id FROM athletes WHERE user_id = ?', [req.user.id]);
  if (!athlete) return res.status(404).json({ error: 'No athlete profile found' });
  const today = new Date().toISOString().slice(0, 10);
  db.run(
    'DELETE FROM rehab_completions WHERE exercise_id = ? AND athlete_id = ? AND completed_date = ?',
    [req.params.exerciseId, athlete.id, today]
  );
  res.json({ success: true });
});

// GET /api/rehab/programs/:id/history — trainer views completion history
router.get('/programs/:id/history', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const program = db.get(`
    SELECT rp.id, rp.name, a.name AS athlete_name
    FROM rehab_programs rp JOIN athletes a ON a.id = rp.athlete_id
    WHERE rp.id = ? AND rp.trainer_id = ?
  `, [req.params.id, req.user.id]);
  if (!program) return res.status(404).json({ error: 'Program not found' });

  const totalExercises = db.get('SELECT COUNT(*) AS cnt FROM rehab_exercises WHERE program_id = ?', [req.params.id]);
  const total = totalExercises ? totalExercises.cnt : 0;

  const rows = db.all(`
    SELECT rc.completed_date, COUNT(*) AS completed_count
    FROM rehab_completions rc
    JOIN rehab_exercises re ON re.id = rc.exercise_id
    WHERE re.program_id = ?
    GROUP BY rc.completed_date
    ORDER BY rc.completed_date DESC
    LIMIT 30
  `, [req.params.id]);

  res.json({ program, total_exercises: total, history: rows });
});

// GET /api/rehab/athletes — trainer fetches their athletes for the program modal
router.get('/athletes', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const athletes = db.all(
    'SELECT id, name, team FROM athletes WHERE trainer_id = ? ORDER BY name',
    [req.user.id]
  );
  res.json(athletes);
});

module.exports = router;
