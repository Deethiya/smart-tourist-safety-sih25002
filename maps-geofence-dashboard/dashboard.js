// Authority Dashboard - Incident Management
// Step 3: Mock incident list (no backend yet)

// ====== BACKEND CONFIG ======
const BACKEND_URL = "http://localhost:3000"; // <-- paste your current ngrok URL here, no trailing slash

// Fetches incidents from the backend
async function fetchIncidents() {
  try {
    const response = await fetch(`${BACKEND_URL}/api/incidents`, {
      headers: {
        "ngrok-skip-browser-warning": "true"
      }
    });

    if (!response.ok) {
      throw new Error(`Server responded with status ${response.status}`);
    }

    const data = await response.json();

    if (data.success) {
      renderIncidents(data.incidents);
    } else {
      showError("Backend returned an error: " + data.message);
    }
  } catch (err) {
    console.error("Failed to fetch incidents:", err);
    showError("Could not connect to backend. Is the server running?");
  }
}

// Shows a simple error message in the incident list area
function showError(message) {
  const container = document.getElementById('incidentListContainer');
  container.innerHTML = `<p style="color: red;">⚠️ ${message}</p>`;
}
// TEMPORARY mock data - we'll replace this with real backend data in Step 4
const mockIncidents = [
  {
    id: 1,
    tourist_id: 101,
    incident_type: "geofence",
    description: "Tourist entered danger zone",
    latitude: 26.1445,
    longitude: 91.7362,
    timestamp: "2026-08-10T10:15:00",
    status: "CREATED"
  },
  {
    id: 2,
    tourist_id: 102,
    incident_type: "sos",
    description: "Tourist pressed SOS button",
    latitude: 26.1500,
    longitude: 91.7400,
    timestamp: "2026-08-10T10:20:00",
    status: "ACKNOWLEDGED"
  }
];

// Builds the HTML table showing all incidents
// Returns a background/text color pair based on incident status
function getStatusColor(status) {
  const colors = {
    CREATED:      { bg: '#fff3cd', text: '#856404' },
    ACKNOWLEDGED: { bg: '#cce5ff', text: '#004085' },
    ASSIGNED:     { bg: '#d6d8ff', text: '#3730a3' },
    RESPONDING:   { bg: '#ffe5b4', text: '#7a4a00' },
    RESOLVED:     { bg: '#d4edda', text: '#155724' },
    CANCELLED:    { bg: '#f8d7da', text: '#721c24' },
    open:         { bg: '#e2e3e5', text: '#383d41' }
  };
  return colors[status] || { bg: '#e2e3e5', text: '#383d41' };
}
function renderIncidents(incidents) {
  const container = document.getElementById('incidentListContainer');

  if (incidents.length === 0) {
    container.innerHTML = '<p>No incidents to show.</p>';
    return;
  }

  let html = `
    <table id="incidentTable">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tourist ID</th>
          <th>Type</th>
          <th>Description</th>
          <th>Coordinates</th>
          <th>Timestamp</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  incidents.forEach(incident => {
    html += `
      <tr>
        <td>${incident.id}</td>
        <td>${incident.tourist_id}</td>
        <td>${incident.incident_type}</td>
        <td>${incident.description}</td>
        <td>${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}</td>
        <td>${incident.timestamp}</td>
        <td>${incident.status}</td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  container.innerHTML = html;
}

// Run this when the page loads
document.addEventListener('DOMContentLoaded', () => {
  fetchIncidents();
});