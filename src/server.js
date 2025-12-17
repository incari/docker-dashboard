const express = require('express');
const cors = require('cors');
const Docker = require('dockerode');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Docker connection - uses socket by default
const docker = new Docker({ socketPath: process.env.DOCKER_SOCKET || '/var/run/docker.sock' });

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/dashboard.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS shortcuts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT DEFAULT 'cube',
    port INTEGER NOT NULL,
    container_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Get all Docker containers with their ports
app.get('/api/containers', async (req, res) => {
  try {
    const containers = await docker.listContainers({ all: true });
    const formatted = containers.map(c => ({
      id: c.Id,
      name: c.Names[0]?.replace('/', '') || 'unknown',
      image: c.Image,
      state: c.State,
      status: c.Status,
      ports: c.Ports.map(p => ({
        private: p.PrivatePort,
        public: p.PublicPort,
        type: p.Type
      })).filter(p => p.public)
    }));
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching containers:', error);
    res.status(500).json({ error: 'Failed to fetch containers' });
  }
});

// Get all shortcuts
app.get('/api/shortcuts', (req, res) => {
  try {
    const shortcuts = db.prepare('SELECT * FROM shortcuts ORDER BY name').all();
    res.json(shortcuts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shortcuts' });
  }
});

// Create a shortcut
app.post('/api/shortcuts', (req, res) => {
  const { name, description, icon, port, container_id } = req.body;
  if (!name || !port) {
    return res.status(400).json({ error: 'Name and port are required' });
  }
  try {
    const stmt = db.prepare(
      'INSERT INTO shortcuts (name, description, icon, port, container_id) VALUES (?, ?, ?, ?, ?)'
    );
    const result = stmt.run(name, description || '', icon || 'cube', port, container_id || null);
    res.json({ id: result.lastInsertRowid, name, description, icon, port, container_id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shortcut' });
  }
});

// Update a shortcut
app.put('/api/shortcuts/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, icon, port, container_id } = req.body;
  try {
    const stmt = db.prepare(
      'UPDATE shortcuts SET name=?, description=?, icon=?, port=?, container_id=?, updated_at=CURRENT_TIMESTAMP WHERE id=?'
    );
    stmt.run(name, description, icon, port, container_id, id);
    res.json({ id, name, description, icon, port, container_id });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update shortcut' });
  }
});

// Delete a shortcut
app.delete('/api/shortcuts/:id', (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('DELETE FROM shortcuts WHERE id=?').run(id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete shortcut' });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Docker Dashboard running on http://0.0.0.0:${PORT}`);
});

