// This is our backend server - it listens for requests and sends back responses

const express = require('express');
const cors = require('cors');
const db = require('./database'); // This connects us to our database file

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ===== HEALTH CHECK =====
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running fine!' });
});

// ===== TOURISTS =====

// GET all tourists
app.get('/api/tourists', (req, res) => {
  db.all('SELECT * FROM tourists', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new tourist
app.post('/api/tourists', (req, res) => {
  const { name, phone, emergency_contact } = req.body;
  db.run(
    'INSERT INTO tourists (name, phone, emergency_contact) VALUES (?, ?, ?)',
    [name, phone, emergency_contact],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, name, phone, emergency_contact });
    }
  );
});

// ===== LOCATIONS =====

// GET all locations
app.get('/api/locations', (req, res) => {
  db.all('SELECT * FROM locations', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new location
app.post('/api/locations', (req, res) => {
  const { tourist_id, latitude, longitude } = req.body;
  db.run(
    'INSERT INTO locations (tourist_id, latitude, longitude) VALUES (?, ?, ?)',
    [tourist_id, latitude, longitude],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, tourist_id, latitude, longitude });
    }
  );
});

// ===== EMERGENCY ALERTS =====

// GET all alerts
app.get('/api/alerts', (req, res) => {
  db.all('SELECT * FROM alerts', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new alert
app.post('/api/alerts', (req, res) => {
  const { tourist_id, alert_type, message, latitude, longitude } = req.body;
  db.run(
    'INSERT INTO alerts (tourist_id, alert_type, message, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
    [tourist_id, alert_type, message, latitude, longitude],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, tourist_id, alert_type, message, latitude, longitude, status: 'pending' });
    }
  );
});

// ===== INCIDENTS =====

// GET all incidents
app.get('/api/incidents', (req, res) => {
  db.all('SELECT * FROM incidents', [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// POST a new incident
app.post('/api/incidents', (req, res) => {
  const { tourist_id, incident_type, description, latitude, longitude } = req.body;
  db.run(
    'INSERT INTO incidents (tourist_id, incident_type, description, latitude, longitude) VALUES (?, ?, ?, ?, ?)',
    [tourist_id, incident_type, description, latitude, longitude],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID, tourist_id, incident_type, description, latitude, longitude, status: 'open' });
    }
  );
});

// This starts the server and makes it listen on port 3000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});