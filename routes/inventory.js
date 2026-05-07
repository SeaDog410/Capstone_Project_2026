const express = require('express');
const { getDb } = require('../db/schema');
const { requireRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/inventory — all items with active loan details
router.get('/', requireRole('trainer', 'admin'), (req, res) => {
  const db = getDb();
  const items = db.all(`
    SELECT i.id, i.name, i.category, i.quantity,
           COUNT(il.id) AS loaned_count
    FROM inventory i
    LEFT JOIN inventory_loans il ON il.inventory_id = i.id AND il.checked_in_at IS NULL
    GROUP BY i.id
    ORDER BY i.category, i.name
  `);
  const loans = db.all(`
    SELECT il.id AS loan_id, il.inventory_id, il.athlete_id, il.checked_out_at, a.name AS athlete_name
    FROM inventory_loans il
    JOIN athletes a ON a.id = il.athlete_id
    WHERE il.checked_in_at IS NULL
    ORDER BY il.checked_out_at
  `);
  const loansByItem = {};
  for (const loan of loans) {
    if (!loansByItem[loan.inventory_id]) loansByItem[loan.inventory_id] = [];
    loansByItem[loan.inventory_id].push(loan);
  }
  res.json(items.map(item => ({ ...item, active_loans: loansByItem[item.id] || [] })));
});

// POST /api/inventory — add a new item
router.post('/', requireRole('trainer', 'admin'), (req, res) => {
  const { name, category, quantity } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'name and category required' });
  const qty = Math.max(0, parseInt(quantity) || 0);
  const db = getDb();
  const result = db.run(
    "INSERT INTO inventory (name, category, quantity, updated_at) VALUES (?, ?, ?, datetime('now'))",
    [name.trim(), category.trim(), qty]
  );
  res.status(201).json({ id: result.lastInsertRowid, name: name.trim(), category: category.trim(), quantity: qty, loaned_count: 0, active_loans: [] });
});

// PATCH /api/inventory/:id/quantity — adjust stock with +/- delta
router.patch('/:id/quantity', requireRole('trainer', 'admin'), (req, res) => {
  const { delta } = req.body;
  if (typeof delta !== 'number') return res.status(400).json({ error: 'delta (number) required' });
  const db = getDb();
  const item = db.get('SELECT id, quantity FROM inventory WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const newQty = Math.max(0, item.quantity + delta);
  db.run("UPDATE inventory SET quantity = ?, updated_at = datetime('now') WHERE id = ?", [newQty, req.params.id]);
  res.json({ id: item.id, quantity: newQty });
});

// POST /api/inventory/:id/checkout — loan item to athlete
router.post('/:id/checkout', requireRole('trainer', 'admin'), (req, res) => {
  const { athlete_id } = req.body;
  if (!athlete_id) return res.status(400).json({ error: 'athlete_id required' });
  const db = getDb();
  const item = db.get('SELECT id, name FROM inventory WHERE id = ?', [req.params.id]);
  if (!item) return res.status(404).json({ error: 'Item not found' });
  const athlete = db.get('SELECT id, name FROM athletes WHERE id = ?', [athlete_id]);
  if (!athlete) return res.status(404).json({ error: 'Athlete not found' });
  const result = db.run(
    "INSERT INTO inventory_loans (inventory_id, athlete_id, checked_out_at, updated_at) VALUES (?, ?, datetime('now'), datetime('now'))",
    [req.params.id, athlete_id]
  );
  res.status(201).json({
    loan_id: result.lastInsertRowid,
    inventory_id: parseInt(req.params.id),
    athlete_id: parseInt(athlete_id),
    athlete_name: athlete.name,
    checked_out_at: new Date().toISOString(),
  });
});

// POST /api/inventory/:id/checkin — return a loaned item
router.post('/:id/checkin', requireRole('trainer', 'admin'), (req, res) => {
  const { loan_id } = req.body;
  if (!loan_id) return res.status(400).json({ error: 'loan_id required' });
  const db = getDb();
  const loan = db.get(
    'SELECT id FROM inventory_loans WHERE id = ? AND inventory_id = ? AND checked_in_at IS NULL',
    [loan_id, req.params.id]
  );
  if (!loan) return res.status(404).json({ error: 'Active loan not found' });
  db.run("UPDATE inventory_loans SET checked_in_at = datetime('now'), updated_at = datetime('now') WHERE id = ?", [loan_id]);
  res.json({ ok: true });
});

module.exports = router;
