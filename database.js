// This file creates our database and all the tables we need

const sqlite3 = require('sqlite3').verbose();

// This creates a file called tourism.db - this IS our database
const db = new sqlite3.Database('./tourism.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database (tourism.db)');
  }
});

// db.serialize makes sure these commands run one after another, in order
db.serialize(() => {

  // Table 1: Tourists
  db.run(`
    CREATE TABLE IF NOT EXISTS tourists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      emergency_contact TEXT
    )
  `);

  // Table 2: Locations
  db.run(`
    CREATE TABLE IF NOT EXISTS locations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourist_id INTEGER,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (tourist_id) REFERENCES tourists(id)
    )
  `);

  // Table 3: Emergency Alerts
  db.run(`
    CREATE TABLE IF NOT EXISTS alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourist_id INTEGER,
      alert_type TEXT,
      message TEXT,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'pending',
      FOREIGN KEY (tourist_id) REFERENCES tourists(id)
    )
  `);

  // Table 4: Incidents
  db.run(`
    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tourist_id INTEGER,
      incident_type TEXT,
      description TEXT,
      latitude REAL,
      longitude REAL,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'open',
      FOREIGN KEY (tourist_id) REFERENCES tourists(id)
    )
  `, () => {
    console.log('All tables created successfully!');
  });

});

// We share "db" with other files so they can use this same database
module.exports = db;