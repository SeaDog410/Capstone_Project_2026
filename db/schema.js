const { Database } = require('node-sqlite3-wasm');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'nest.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.run('PRAGMA journal_mode = WAL');
    db.run('PRAGMA foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('trainer','athlete','coach','admin')),
      name TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS athletes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      team TEXT,
      clearance_status TEXT NOT NULL DEFAULT 'green' CHECK(clearance_status IN ('red','yellow','green')),
      trainer_id INTEGER NOT NULL REFERENCES users(id),
      age INTEGER,
      height TEXT,
      weight INTEGER,
      year TEXT,
      phone TEXT,
      emergency_contact_name TEXT,
      emergency_contact_phone TEXT,
      insurance TEXT,
      blood_type TEXT,
      allergies TEXT,
      medications TEXT,
      medical_history TEXT,
      last_physical TEXT,
      primary_physician TEXT,
      injury_type TEXT,
      body_part TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS clearance_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trainer_id INTEGER REFERENCES users(id),
      athlete_id INTEGER REFERENCES athletes(id),
      note TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS encounters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      athlete_id INTEGER NOT NULL REFERENCES athletes(id),
      trainer_id INTEGER NOT NULL REFERENCES users(id),
      subjective TEXT,
      objective TEXT,
      assessment TEXT,
      plan TEXT,
      voice_transcript TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS rehab_programs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      athlete_id INTEGER NOT NULL REFERENCES athletes(id),
      trainer_id INTEGER NOT NULL REFERENCES users(id),
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS rehab_exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      program_id INTEGER NOT NULL REFERENCES rehab_programs(id),
      exercise_name TEXT NOT NULL,
      sets INTEGER NOT NULL,
      reps INTEGER NOT NULL,
      frequency TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS rehab_completions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER NOT NULL REFERENCES rehab_exercises(id),
      athlete_id INTEGER NOT NULL REFERENCES athletes(id),
      completed_date TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced',
      UNIQUE(exercise_id, athlete_id, completed_date)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      quantity INTEGER NOT NULL DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS inventory_loans (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      inventory_id INTEGER NOT NULL REFERENCES inventory(id),
      athlete_id INTEGER NOT NULL REFERENCES athletes(id),
      checked_out_at TEXT NOT NULL DEFAULT (datetime('now')),
      checked_in_at TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      sync_status TEXT NOT NULL DEFAULT 'synced'
    );

    CREATE TABLE IF NOT EXISTS exercise_library (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      category TEXT NOT NULL
    );
  `);

  try { db.exec("ALTER TABLE encounters ADD COLUMN injury_type TEXT DEFAULT ''"); } catch {}
  try { db.exec("ALTER TABLE encounters ADD COLUMN body_part TEXT DEFAULT ''"); } catch {}

  // Sprint 2 Schema Migrations
  try { db.exec("ALTER TABLE athletes DROP COLUMN sport"); } catch {}
  const athleteColumns = [
    'age INTEGER', 'height TEXT', 'weight INTEGER', 'year TEXT', 'phone TEXT',
    'emergency_contact_name TEXT', 'emergency_contact_phone TEXT', 'insurance TEXT',
    'blood_type TEXT', 'allergies TEXT', 'medications TEXT', 'medical_history TEXT',
    'last_physical TEXT', 'primary_physician TEXT', 'injury_type TEXT', 'body_part TEXT'
  ];
  for (const col of athleteColumns) {
    try { db.exec(`ALTER TABLE athletes ADD COLUMN ${col}`); } catch {}
  }

  seedExerciseLibrary();
  seedInventory();
  seedSprint2DemoData();
}

function seedExerciseLibrary() {
  const exercises = [
    ['Quad Sets', 'Quadriceps'],
    ['Straight Leg Raise', 'Quadriceps'],
    ['Short Arc Quads', 'Quadriceps'],
    ['Terminal Knee Extension', 'Knee Stability'],
    ['Clamshells', 'Hip Strengthening'],
    ['Glute Bridge', 'Hip Strengthening'],
    ['Side-Lying Hip Abduction', 'Hip Strengthening'],
    ['Monster Walk (Band)', 'Hip Strengthening'],
    ['Single-Leg Balance', 'Proprioception'],
    ['BAPS Board', 'Proprioception'],
    ['Ankle Alphabet', 'Ankle Mobility'],
    ['Calf Raises', 'Lower Leg'],
    ['Eccentric Calf Raise', 'Lower Leg'],
    ['Nordic Hamstring Curl', 'Hamstring'],
    ['Prone Hamstring Curl', 'Hamstring'],
    ['Shoulder Pendulum', 'Shoulder Mobility'],
    ['External Rotation (Band)', 'Shoulder Strengthening'],
    ['Scapular Retraction', 'Shoulder Strengthening'],
    ['Prone Y-T-W', 'Shoulder Strengthening'],
    ['Cervical Chin Tucks', 'Cervical Spine'],
  ];
  const stmt = db.prepare('INSERT OR IGNORE INTO exercise_library (name, category) VALUES (?, ?)');
  for (const [name, category] of exercises) {
    stmt.run([name, category]);
  }
}

function seedInventory() {
  const existing = db.get('SELECT COUNT(*) AS cnt FROM inventory');
  if (existing && existing.cnt > 0) return;
  const items = [
    ['Athletic Tape (1.5")', 'Consumable', 50],
    ['Pre-Wrap Foam', 'Consumable', 30],
    ['Elastic Bandage (3")', 'Consumable', 20],
    ['Ice Bags', 'Consumable', 100],
    ['Nitrile Gloves (M)', 'Consumable', 200],
    ['Foam Roller', 'Equipment', 8],
    ['Resistance Band (Light)', 'Equipment', 15],
    ['Resistance Band (Medium)', 'Equipment', 15],
    ['Resistance Band (Heavy)', 'Equipment', 10],
    ['TENS Unit', 'Equipment', 3],
    ['Crutches', 'Equipment', 4],
    ['Knee Compression Sleeve', 'Equipment', 6],
  ];
  const stmt = db.prepare('INSERT INTO inventory (name, category, quantity) VALUES (?, ?, ?)');
  for (const [name, category, quantity] of items) {
    stmt.run([name, category, quantity]);
  }
}

// ---------------------------------------------------------
// SPRINT 2 SEED DATA (REMOVE BEFORE PRODUCTION)
// ---------------------------------------------------------
function seedSprint2DemoData() {
  const existingTask = db.get('SELECT COUNT(*) AS cnt FROM clearance_tasks');
  if (existingTask && existingTask.cnt > 0) return;

  console.log('Seeding Sprint 2 Demo Data...');

  db.run('INSERT OR IGNORE INTO users (id, email, password_hash, role, name) VALUES (?, ?, ?, ?, ?)', 
    [1, 'trainer@thenest.com', 'hash', 'trainer', 'Taylor Morgan']);

  const athletes = [
    [901, 'Marcus T.'],
    [902, 'Sarah J.'],
    [903, 'Team A']
  ];
  const athleteStmt = db.prepare('INSERT OR IGNORE INTO athletes (id, user_id, name, trainer_id) VALUES (?, NULL, ?, 1)');
  for (const [id, name] of athletes) {
    athleteStmt.run([id, name]);
  }

  const encounters = [
    // 2025 Data (Jul - Dec)
    ['2025-08-15 10:00:00', 'Sprained ankle during practice', 'Ankle Sprain', 'Ankle'],
    ['2025-09-22 14:30:00', 'Shoulder pain after lifting', 'Strain', 'Shoulder'],
    ['2025-10-05 09:15:00', 'Knee discomfort', 'Patellar Tendinitis', 'Knee'],
    ['2025-11-12 16:00:00', 'Concussion protocol', 'Concussion', 'Head'],
    // 2026 Data (Jan - May)
    ['2026-01-20 11:00:00', 'Hamstring pull', 'Strain', 'Hamstring'],
    ['2026-02-14 13:45:00', 'Wrist sprain', 'Sprain', 'Wrist'],
    ['2026-03-30 15:20:00', 'Lower back tightness', 'Muscle Spasm', 'Lower Back'],
    ['2026-04-18 08:30:00', 'Rolled ankle', 'Ankle Sprain', 'Ankle']
  ];
  const encStmt = db.prepare('INSERT INTO encounters (athlete_id, trainer_id, subjective, injury_type, body_part, created_at, updated_at) VALUES (?, 1, ?, ?, ?, ?, ?)');
  for (const [date, sub, type, part] of encounters) {
    encStmt.run([901, sub, type, part, date, date]);
  }

  const tasks = [
    [901, "Approve return-to-play — Marcus T. | Ankle sprain cleared by physician", "pending"],
    [902, "Review rehab progression — Sarah J. | Completed 4 of 6 sessions", "pending"],
    [903, "Update clearance status — Team A | Post-game injury report pending", "done"]
  ];
  const taskStmt = db.prepare('INSERT INTO clearance_tasks (trainer_id, athlete_id, note, status) VALUES (1, ?, ?, ?)');
  for (const [athlete_id, note, status] of tasks) {
    taskStmt.run([athlete_id, note, status]);
  }
}

module.exports = { getDb };
