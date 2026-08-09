# Backend Integration Guide — SIH25002

Base URL (use this, not localhost):
https://mocker-fasting-squealer.ngrok-free.dev

IMPORTANT: every request MUST include this header, or you'll get an HTML page instead of JSON:
ngrok-skip-browser-warning: true

---

## For Tourist App team — send a location update

POST /api/locations
Headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
Body:
{
  "tourist_id": 1,
  "latitude": 28.6139,
  "longitude": 77.2090
}

## For AI/Voice team — send an emergency alert

POST /api/alerts
Headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
Body:
{
  "tourist_id": 1,
  "alert_type": "voice_sos",
  "message": "Emergency detected by voice AI",
  "latitude": 28.6139,
  "longitude": 77.2090
}

## For Map/Geofence team — send a geofence warning

POST /api/alerts
Headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
Body:
{
  "tourist_id": 1,
  "alert_type": "geofence",
  "message": "Tourist entered restricted zone",
  "latitude": 28.7041,
  "longitude": 77.1025
}

## For Map/Dashboard team — get a tourist's latest location

GET /api/locations/latest/1
Headers: { "ngrok-skip-browser-warning": "true" }

## For Dashboard team — mark an alert as resolved

PUT /api/alerts/23
Headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" }
Body:
{ "status": "resolved" }