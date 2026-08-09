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

// SAFE ZONE (green circle)
const safeZone = L.circle([28.6139, 77.2090], {
  color: 'green',
  fillColor: '#3f3',
  fillOpacity: 0.2,
  radius: 400,
}).addTo(map).bindPopup('SAFE ZONE');

// DANGER ZONE (red circle)
const dangerZoneCenter = [28.6165, 77.2135];
const dangerZoneRadius = 300; // meters

const dangerZone = L.circle(dangerZoneCenter, {
  color: 'red',
  fillColor: '#f33',
  fillOpacity: 0.3,
  radius: dangerZoneRadius,
}).addTo(map).bindPopup('DANGER ZONE');


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

      checkGeofence();  
    },
    (error) => {
      console.log('GPS not available, using demo location instead.', error);
      checkGeofence();
    }
  );
} else {
  console.log('Geolocation not supported by this browser. Using demo location.');
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

function checkGeofence() {
  const distanceToDanger = getDistanceInMeters(
    touristLat, touristLng,
    dangerZoneCenter[0], dangerZoneCenter[1]
  );

  const statusDiv = document.getElementById('status');

  if (distanceToDanger <= dangerZoneRadius) {
    // Inside danger zone
    statusDiv.textContent = 'Status: DANGER! You are in a restricted zone';
    statusDiv.className = 'emergency';
    alert('⚠️ WARNING: You have entered a DANGER ZONE!');
    sendAlertToBackend(touristLat, touristLng);
  } else if (distanceToDanger <= dangerZoneRadius + 200) {
    // Close to danger zone
    statusDiv.textContent = 'Status: WARNING - Near a restricted zone';
    statusDiv.className = 'warning';
  } else {
    // Safe
    statusDiv.textContent = 'Status: SAFE';
    statusDiv.className = 'safe';
  }
}
// =======================
// 7. SEND ALERT TO BACKEND
// =======================

// This is where the backend teammate's server will run.
// For now, we use localhost (their local test server) — we'll update this
// once they give us the real server address.
const BACKEND_URL = 'https://mocker-fasting-squealer.ngrok-free.dev/api/alerts';

function sendAlertToBackend(lat, lng) {
  // Build the alert object (a simple package of data)
  const alertData = {
    alert_type: 'geofence',
    tourist_id: 'demo-tourist-001',
    message: 'Tourist entered danger zone',
    latitude: lat,
    longitude: lng,
  };

  console.log('Sending alert to backend:', alertData);

  fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
    },
    body: JSON.stringify(alertData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Backend confirmed alert received:', data);
    })
    .catch((error) => {
      console.log('Could not reach backend (this is OK for now if backend is not running yet):', error);
    });
}
// Run once immediately using demo location too
checkGeofence();
