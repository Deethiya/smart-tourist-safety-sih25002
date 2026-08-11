// =======================
// 1. CREATE THE MAP
// =======================

// Default location: New Delhi (used if GPS is not available)
const DEFAULT_LAT = 28.6139;
const DEFAULT_LNG = 77.2090;

// Create the map and center it on default location
const map = L.map('map').setView([DEFAULT_LAT, DEFAULT_LNG], 14);

// Add free OpenStreetMap tiles (no API key needed)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors',
  maxZoom: 19,
}).addTo(map);


// =======================
// 2. SAMPLE ZONES (DEMO DATA)
// =======================

// =======================
// ZONES DATA (all zones in one place - easy to edit/share)
// =======================

const zonesData = {
  safeZones: [
    { name: 'Safe Zone 1', center: [28.6139, 77.2090], radius: 400 },
    { name: 'Safe Zone 2', center: [28.6100, 77.2200], radius: 350 },
  ],
  dangerZones: [
    { name: 'Danger Zone 1', center: [28.6165, 77.2135], radius: 300 },
    { name: 'Danger Zone 2', center: [28.6080, 77.2160], radius: 250 },
  ],
};

// Draw all safe zones
zonesData.safeZones.forEach((zone) => {
  L.circle(zone.center, {
    color: 'green',
    fillColor: '#3f3',
    fillOpacity: 0.2,
    radius: zone.radius,
  }).addTo(map)
    .bindPopup(zone.name)
    .bindTooltip(zone.name, { permanent: true, direction: 'center', className: 'zone-label safe-label' });
});

// Draw all danger zones + their warning buffer ring
zonesData.dangerZones.forEach((zone) => {
  // Outer warning buffer ring (dashed orange)
  L.circle(zone.center, {
    color: 'orange',
    fillColor: 'transparent',
    fillOpacity: 0,
    radius: zone.radius + 200,
    dashArray: '6, 6',
    weight: 2,
  }).addTo(map).bindPopup(zone.name + ' - Warning Buffer');

  // Actual danger zone (solid red)
  L.circle(zone.center, {
    color: 'red',
    fillColor: '#f33',
    fillOpacity: 0.3,
    radius: zone.radius,
  }).addTo(map)
    .bindPopup(zone.name)
    .bindTooltip(zone.name, { permanent: true, direction: 'center', className: 'zone-label danger-label' });
});

// Keep these variables for backward compatibility with geofence detection below
const dangerZoneCenter = zonesData.dangerZones[0].center;
const dangerZoneRadius = zonesData.dangerZones[0].radius;

// =======================
// 3. EMERGENCY MARKERS (DEMO DATA)
// =======================

const emergencyIcon = L.divIcon({
  html: '🚨',
  iconSize: [25, 25],
  className: '',
});

L.marker([28.6120, 77.2100], { icon: emergencyIcon })
  .addTo(map)
  .bindPopup('EMERGENCY LOCATION: Police Help Point');


// =======================
// 4. TOURIST MARKER (DEMO LOCATION)
// =======================

// Start the tourist near the danger zone so we can test the warning
let touristLat = 28.6155;
let touristLng = 77.2120;

const touristIcon = L.divIcon({
  html: '🧍',
  iconSize: [25, 25],
  className: '',
});

const touristMarker = L.marker([touristLat, touristLng], { icon: touristIcon })
  .addTo(map)
  .bindPopup('TOURIST LOCATION');


// =======================
// 5. TRY REAL GPS LOCATION (IF AVAILABLE)
// =======================

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      touristLat = position.coords.latitude;
      touristLng = position.coords.longitude;

      touristMarker.setLatLng([touristLat, touristLng]);
      map.setView([touristLat, touristLng], 14);

      document.getElementById('locationSource').textContent = '📍 Using real GPS location';
      checkGeofence();  
    },
    (error) => {
      console.log('GPS not available, using demo location instead.', error);
      document.getElementById('locationSource').textContent = '🧭 Using demo location (GPS unavailable/denied)';
      checkGeofence();
    }
  );
} else {
  console.log('Geolocation not supported by this browser. Using demo location.');
  document.getElementById('locationSource').textContent = '🧭 Using demo location (GPS not supported)';
  checkGeofence();
}
// =======================
// 6. GEOFENCE DETECTION
// =======================

function getDistanceInMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Track if we already sent an alert for the CURRENT danger zone visit,
// so we don't spam the backend with duplicate alerts every time checkGeofence() runs.
let alertAlreadySent = false;

function checkGeofence() {
  const statusDiv = document.getElementById('status');
  const warningBanner = document.getElementById('warningBanner');

  let closestDangerDistance = Infinity;
  let insideDangerZone = false;
  let insideWarningBuffer = false;

  // Check distance to EVERY danger zone, not just one
  zonesData.dangerZones.forEach((zone) => {
    const distance = getDistanceInMeters(
      touristLat, touristLng,
      zone.center[0], zone.center[1]
    );

    if (distance < closestDangerDistance) {
      closestDangerDistance = distance;
    }

    if (distance <= zone.radius) {
      insideDangerZone = true;
    } else if (distance <= zone.radius + 200) {
      insideWarningBuffer = true;
    }
  });

  if (insideDangerZone) {
    // Inside a danger zone
    statusDiv.textContent = 'Status: DANGER! You are in a restricted zone';
    statusDiv.className = 'emergency';
    warningBanner.style.display = 'block';

    // Only send ONE alert per danger-zone visit, not on every check
    if (!alertAlreadySent) {
      sendAlertToBackend(touristLat, touristLng);
      alertAlreadySent = true;
    }
  } else if (insideWarningBuffer) {
    // Close to a danger zone
    statusDiv.textContent = 'Status: WARNING - Near a restricted zone';
    statusDiv.className = 'warning';
    warningBanner.style.display = 'none';
    alertAlreadySent = false; // reset, so a future danger-zone entry sends a fresh alert
  } else {
    // Safe
    statusDiv.textContent = 'Status: SAFE';
    statusDiv.className = 'safe';
    warningBanner.style.display = 'none';
    alertAlreadySent = false; // reset
  }
}
// =======================
// 7. SEND ALERT TO BACKEND
// =======================

// ⚠️ UPDATE THIS LINE whenever your backend teammate gives you a new URL.
// This is the ONLY place you need to change it.
const BACKEND_URL = 'http://localhost:3000/api/incidents';
function sendAlertToBackend(lat, lng) {
  // Build the alert object (a simple package of data)
const alertData = {
  incident_type: 'geofence',
  tourist_id: 1,
  description: 'Tourist entered danger zone',
  latitude: lat,
  longitude: lng,
};

  console.log('Sending alert to backend:', alertData);
  updateAlertStatusUI('sending');

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(alertData),
  })
    .then((response) => {
      if (!response.ok) {
        // Backend responded, but with an error status (like 404 or 500)
        throw new Error('Backend returned status ' + response.status);
      }
      return response.json();
    })
    .then((data) => {
      console.log('Backend confirmed alert received:', data);
      if (data.success) {
        updateAlertStatusUI('success', data);
      } else {
        updateAlertStatusUI('failed', data);
      }
    })
    .catch((error) => {
      console.log('Could not reach backend (this is OK for now if backend is not running yet):', error);
      updateAlertStatusUI('offline');
    });
}
// =======================
// 8. SHOW ALERT STATUS ON SCREEN
// =======================

function updateAlertStatusUI(state, data) {
  const alertStatusDiv = document.getElementById('alertStatus');
  alertStatusDiv.style.display = 'block';

  if (state === 'sending') {
    alertStatusDiv.textContent = '📡 Sending alert to backend...';
    alertStatusDiv.style.background = '#fff3cd';
    alertStatusDiv.style.color = '#856404';
  } else if (state === 'success') {
    alertStatusDiv.textContent = '✅ Alert confirmed by backend (ID: ' + data.incidentId + ')';
    alertStatusDiv.style.background = '#d4edda';
    alertStatusDiv.style.color = '#155724';
  } else if (state === 'failed') {
    alertStatusDiv.textContent = '⚠️ Backend responded but rejected the alert: ' + data.message;
    alertStatusDiv.style.background = '#f8d7da';
    alertStatusDiv.style.color = '#721c24';
  } else if (state === 'offline') {
    alertStatusDiv.textContent = '🔌 Backend not reachable (alert saved locally only)';
    alertStatusDiv.style.background = '#e2e3e5';
    alertStatusDiv.style.color = '#383d41';
  }
}
