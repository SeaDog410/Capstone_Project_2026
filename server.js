const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./db/schema');
const { requireAuth } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize DB on startup
getDb();

// Auth routes (public)
app.use('/auth', require('./routes/auth'));

// All other API routes require auth
app.use('/api', requireAuth);
app.use('/api/athletes', require('./routes/athletes'));
app.use('/api/encounters', require('./routes/encounters'));
app.use('/api/rehab', require('./routes/rehab'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/clearance-tasks', require('./routes/clearance-tasks'));
app.use('/voice', requireAuth, require('./routes/voice'));

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`The Nest running on http://localhost:${PORT}`);
});
