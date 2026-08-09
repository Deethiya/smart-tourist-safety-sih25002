# 🎤 Voice Emergency Feature — Integration Guide for Frontend Team

## What this feature does
Listens to the tourist's voice, detects emergency type (DANGER, MEDICAL, LOST, GENERAL EMERGENCY),
shows it on screen, sends it to the backend, and speaks a response back to the user.

## Files you need
Copy this file into your project:
- `voice-emergency-demo/index.html` (contains all the logic, HTML, and styling)

## How to trigger the voice emergency feature from your app

### Option 1 (Simplest): Use the button already built
Just include our HTML button in your page:
```html
<button id="sosBtn">🎤 PRESS FOR SOS</button>
```

### Option 2: Trigger it from YOUR OWN button/component
Call this function from your own code, whenever your app needs to start listening:
```javascript
startVoiceEmergency();
```

Example — if you have your own SOS button in React/HTML:
```html
<button onclick="startVoiceEmergency()">Emergency</button>
```

## Required HTML elements
Our script expects these elements to exist somewhere on the page:
```html
<div id="status">Waiting...</div>
<div id="result">
  <p>You said: <span id="heardText"></span></p>
  <p>Detected Emergency: <span id="emergencyType"></span></p>
  <p>System Response: <span id="responseText"></span></p>
</div>
```
(You can restyle these however you like — just keep the same `id` names)

## What data gets sent to the backend
```json
POST http://localhost:3000/api/alerts
{
  "alert_type": "DANGER",
  "message": "I am in danger"
}
```

## Browser requirement
⚠️ Must be tested in Google Chrome or Microsoft Edge (Web Speech API not supported in Firefox).

## Questions?
Contact: [Abhineeth] — branch: feature/ai-voice-emergency