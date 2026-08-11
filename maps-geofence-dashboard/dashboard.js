// Authority Dashboard - Incident Management
// Step 3: Mock incident list (no backend yet)

// ====== BACKEND CONFIG ======
const BACKEND_URL = "http://localhost:3000"; // <-- paste your current ngrok URL here, no trailing slash
let currentIncidents = []; // holds the incidents we've fetched, so we can update status locally
let responderAssignments = {}; // stores incidentId -> responder name (mock, frontend-only)

let incidentMap = null; // Leaflet map instance
let incidentMarkers = []; // tracks markers so we can clear/redraw them
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
      currentIncidents = data.incidents; // save for later status updates
      renderIncidents(data.incidents);
      updateMapMarkers(data.incidents);
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
          <th>Update Status</th>
          <th>Responder</th>
        </tr>
        </tr>
      </thead>
      <tbody>
  `;

 const statusOptions = ["CREATED", "ACKNOWLEDGED", "ASSIGNED", "RESPONDING", "RESOLVED", "CANCELLED"];

  incidents.forEach(incident => {
    const colors = getStatusColor(incident.status);
    const optionsHtml = statusOptions.map(opt =>
      `<option value="${opt}" ${opt === incident.status ? "selected" : ""}>${opt}</option>`
    ).join("");

    html += `
      <tr>
        <td>${incident.id}</td>
        <td>${incident.tourist_id}</td>
        <td>${incident.incident_type}</td>
        <td>${incident.description}</td>
        <td>${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}</td>
        <td>${incident.timestamp}</td>
        <td style="background:${colors.bg}; color:${colors.text}; font-weight:bold; padding:4px 8px; border-radius:4px;">${incident.status}</td>
        <td>
          <select onchange="updateIncidentStatus(${incident.id}, this.value)">
            ${optionsHtml}
          </select>
        </td>
        <td>
          <input
            type="text"
            placeholder="Assign officer..."
            value="${responderAssignments[incident.id] || ''}"
            onchange="assignResponder(${incident.id}, this.value)"
            style="padding:4px; width:120px;"
          />
        </td>
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
// Initializes the Leaflet map (called once, on page load)
function initMap() {
  incidentMap = L.map('incidentMap').setView([26.1445, 91.7362], 12); // default center

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(incidentMap);
}

// Clears old markers and plots current incidents on the map
function updateMapMarkers(incidents) {
  // Remove old markers first
  incidentMarkers.forEach(marker => incidentMap.removeLayer(marker));
  incidentMarkers = [];

  if (incidents.length === 0) return;

  incidents.forEach(incident => {
    const marker = L.marker([incident.latitude, incident.longitude])
      .addTo(incidentMap)
      .bindPopup(`
        <b>${incident.incident_type}</b><br>
        ${incident.description}<br>
        Status: ${incident.status}
      `);
    incidentMarkers.push(marker);
  });

  // Auto-fit map to show all markers
  const group = new L.featureGroup(incidentMarkers);
  incidentMap.fitBounds(group.getBounds().pad(0.2));
}
// Updates an incident's status locally (mock — no backend PUT route yet)
function updateIncidentStatus(incidentId, newStatus) {
    // Stores a responder name for an incident locally (mock — no backend column yet)
function assignResponder(incidentId, responderName) {
  responderAssignments[incidentId] = responderName;
  console.log(`Incident ${incidentId} assigned to: ${responderName}`);
}
  const incident = currentIncidents.find(i => i.id === incidentId);
  if (!incident) return;

  incident.status = newStatus;
  renderIncidents(currentIncidents); // re-render table with updated status
  console.log(`Incident ${incidentId} status updated to ${newStatus}`);
}
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  fetchIncidents();
}); 