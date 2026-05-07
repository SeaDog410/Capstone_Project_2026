const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { getDb } = require('../db/schema');
const { JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// POST /auth/register
router.post('/register', (req, res) => {
  const { email, password, name, role } = req.body;
  if (!email || !password || !name || !role) {
    return res.status(400).json({ error: 'email, password, name, and role are required' });
  }
  const validRoles = ['trainer', 'athlete', 'coach', 'admin'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }
  const db = getDb();
  const existing = db.get('SELECT id FROM users WHERE email = ?', [email]);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }
  const password_hash = bcrypt.hashSync(password, 10);
  const result = db.run(
    'INSERT INTO users (email, password_hash, role, name) VALUES (?, ?, ?, ?)',
    [email, password_hash, role, name]
  );
  const token = jwt.sign(
    { id: result.lastInsertRowid, email, role, name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.status(201).json({ token, user: { id: result.lastInsertRowid, email, role, name } });
});

// POST /auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const db = getDb();
  const user = db.get('SELECT * FROM users WHERE email = ?', [email]);
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
  res.json({ token, user: { id: user.id, email: user.email, role: user.role, name: user.name } });
});

module.exports = router;
