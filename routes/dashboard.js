const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

router.get('/summary', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();

  const rows = db.all(
    'SELECT clearance_status, COUNT(*) AS count FROM athletes WHERE trainer_id = ? GROUP BY clearance_status',
    [req.user.id]
  );
  const counts = { green: 0, yellow: 0, red: 0 };
  for (const row of rows) counts[row.clearance_status] = row.count;

  const incompleteSoap = db.all(
    `SELECT e.id, e.athlete_id, a.name AS athlete_name, e.created_at
     FROM encounters e
     JOIN athletes a ON a.id = e.athlete_id
     WHERE e.trainer_id = ? AND e.assessment = '' AND e.plan = ''
     ORDER BY e.created_at DESC`,
    [req.user.id]
  );

  const rehabActive = db.all(
    `SELECT a.id AS athlete_id, a.name AS athlete_name,
            rp.id AS program_id, MAX(rc.completed_date) AS last_completion
     FROM rehab_completions rc
     JOIN athletes a ON a.id = rc.athlete_id
     JOIN rehab_exercises re ON re.id = rc.exercise_id
     JOIN rehab_programs rp ON rp.id = re.program_id
     WHERE a.trainer_id = ? AND rc.completed_date >= date('now', '-7 days')
     GROUP BY a.id`,
    [req.user.id]
  );

  const clearanceTasks = db.all(
    `SELECT ct.id, ct.athlete_id, a.name AS athlete_name, ct.note, ct.created_at
     FROM clearance_tasks ct
     JOIN athletes a ON a.id = ct.athlete_id
     WHERE ct.trainer_id = ? AND ct.status = 'pending'
     ORDER BY ct.created_at DESC`,
    [req.user.id]
  );

  const pendingActions = [
    ...incompleteSoap.map(e => ({
      type: 'soap',
      id: e.id,
      athlete_id: e.athlete_id,
      athlete_name: e.athlete_name,
      label: 'Incomplete SOAP Note',
      date: e.created_at,
    })),
    ...rehabActive.map(a => ({
      type: 'rehab',
      id: a.program_id,
      athlete_id: a.athlete_id,
      athlete_name: a.athlete_name,
      label: 'Rehab Active',
      date: a.last_completion,
    })),
    ...clearanceTasks.map(t => ({
      type: 'clearance',
      id: t.id,
      athlete_id: t.athlete_id,
      athlete_name: t.athlete_name,
      label: 'CLEARANCE',
      note: t.note,
      date: t.created_at,
    })),
  ];
  
  pendingActions.sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({
    healthSummary: {
      healthy: counts.green,
      limited: counts.yellow,
      out: counts.red,
    },
    pendingActions,
    pendingCount: pendingActions.length,
  });
});

module.exports = router;
