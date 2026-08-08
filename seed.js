// This file adds demo/sample data to the database - run it ONCE manually
const db = require('./database.js');

db.serialize(() => {
  console.log('Adding demo data...');

  // Demo tourists
  db.run(`INSERT INTO tourists (name, phone, emergency_contact) VALUES 
    ('Amit Sharma', '9812345670', '9800011122'),
    ('Priya Nair', '9823456781', '9800022233'),
    ('John Mathew', '9834567892', '9800033344')`);

  // Demo locations (tourist_id 1 = Amit, 2 = Priya, 3 = John, roughly)
  db.run(`INSERT INTO locations (tourist_id, latitude, longitude) VALUES 
    (1, 28.6139, 77.2090),
    (2, 19.0760, 72.8777),
    (3, 12.9716, 77.5946)`);

  // Demo alert (one pending SOS)
  db.run(`INSERT INTO alerts (tourist_id, alert_type, message, latitude, longitude, status) VALUES 
    (2, 'SOS', 'Tourist pressed emergency button near market', 19.0760, 72.8777, 'pending')`);

  // Demo incident
  db.run(`INSERT INTO incidents (tourist_id, incident_type, description, latitude, longitude, status) VALUES 
    (3, 'Lost', 'Tourist reported being lost near train station', 12.9716, 77.5946, 'open')`, () => {
    console.log('Demo data added successfully! You can now close this script.');
    process.exit(0);
  });
});