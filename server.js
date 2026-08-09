// This is our main backend server file

const express = require('express');
const cors = require('cors');
const db = require('./database.js'); // connects to our SQLite database

const app = express();
const PORT = 3000;

// Allow frontend (running on a different port) to talk to us
app.use(cors());

// Allow server to understand JSON data sent from frontend
app.use(express.json());

// Simple health check route - tells us the server is alive
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Backend server is running!'
  });
});
// GET all tourists - frontend uses this to see the list of registered tourists
app.get('/api/tourists', (req, res) => {
  db.all('SELECT * FROM tourists', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, tourists: rows });
  });
});
// GET one tourist by their ID - AI voice team uses this to quickly look up tourist details
app.get('/api/tourists/:id', (req, res) => {
  const { id } = req.params;

  db.get('SELECT * FROM tourists WHERE id = ?', [id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'Tourist not found' });
    }
    res.json({ success: true, tourist: row });
  });
});

// POST a new tourist - frontend uses this to register a tourist
app.post('/api/tourists', (req, res) => {
  const { name, phone, emergency_contact } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ success: false, message: 'Name and phone are required' });
  }

  const sql = 'INSERT INTO tourists (name, phone, emergency_contact) VALUES (?, ?, ?)';
  db.run(sql, [name, phone, emergency_contact || null], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({
      success: true,
      message: 'Tourist added successfully',
      touristId: this.lastID
    });
  });
});
// GET all locations - frontend/map uses this to see where tourists are
app.get('/api/locations', (req, res) => {
  db.all('SELECT * FROM locations', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, locations: rows });
  });
});
// GET a tourist's latest/current location - maps team uses this to show live position
app.get('/api/locations/latest/:tourist_id', (req, res) => {
  const { tourist_id } = req.params;

  const sql = `SELECT * FROM locations WHERE tourist_id = ? ORDER BY timestamp DESC LIMIT 1`;
  db.get(sql, [tourist_id], (err, row) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (!row) {
      return res.status(404).json({ success: false, message: 'No location found for this tourist' });
    }
    res.json({ success: true, location: row });
  });
});

// POST a new location - frontend sends tourist's current GPS position
app.post('/api/locations', (req, res) => {
  const { tourist_id, latitude, longitude } = req.body;

  if (!tourist_id || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, message: 'tourist_id, latitude and longitude are required' });
  }

  const sql = 'INSERT INTO locations (tourist_id, latitude, longitude) VALUES (?, ?, ?)';
  db.run(sql, [tourist_id, latitude, longitude], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({
      success: true,
      message: 'Location saved successfully',
      locationId: this.lastID
    });
  });
});
// GET all alerts - dashboard team uses this to see emergency alerts
app.get('/api/alerts', (req, res) => {
  db.all('SELECT * FROM alerts ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, alerts: rows });
  });
});

// POST a new alert - frontend sends this when tourist presses SOS button
app.post('/api/alerts', (req, res) => {
  const { tourist_id, alert_type, message, latitude, longitude } = req.body;

  if (!tourist_id || !alert_type) {
    return res.status(400).json({ success: false, message: 'tourist_id and alert_type are required' });
  }

  const sql = `INSERT INTO alerts (tourist_id, alert_type, message, latitude, longitude) 
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [tourist_id, alert_type, message || 'Emergency alert', latitude || null, longitude || null], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({
      success: true,
      message: 'Emergency alert received',
      alertId: this.lastID
    });
  });
});
// PUT (update) an alert's status - dashboard team uses this to mark an alert as resolved
app.put('/api/alerts/:id', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ success: false, message: 'status is required' });
  }

  const sql = 'UPDATE alerts SET status = ? WHERE id = ?';
  db.run(sql, [status, id], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    if (this.changes === 0) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }
    res.json({
      success: true,
      message: 'Alert status updated successfully'
    });
  });
});
// GET all incidents - dashboard team uses this to see reported incidents
app.get('/api/incidents', (req, res) => {
  db.all('SELECT * FROM incidents ORDER BY timestamp DESC', [], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({ success: true, incidents: rows });
  });
});

// POST a new incident - frontend sends this when tourist reports a problem
app.post('/api/incidents', (req, res) => {
  const { tourist_id, incident_type, description, latitude, longitude } = req.body;

  if (!tourist_id || !incident_type) {
    return res.status(400).json({ success: false, message: 'tourist_id and incident_type are required' });
  }

  const sql = `INSERT INTO incidents (tourist_id, incident_type, description, latitude, longitude) 
               VALUES (?, ?, ?, ?, ?)`;
  db.run(sql, [tourist_id, incident_type, description || null, latitude || null, longitude || null], function (err) {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    res.json({
      success: true,
      message: 'Incident reported successfully',
      incidentId: this.lastID
    });
  });
});
// If someone requests a route that doesn't exist, send a clear message instead of a crash
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Catch-all error handler - if anything unexpected goes wrong, respond safely instead of crashing
app.use((err, req, res, next) => {
  console.error('Unexpected error:', err.message);
  res.status(500).json({ success: false, message: 'Something went wrong on the server' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});