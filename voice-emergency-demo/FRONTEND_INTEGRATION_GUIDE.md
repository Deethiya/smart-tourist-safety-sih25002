# 🎤 Voice Emergency Feature — Integration Guide for Frontend Team

## What this feature does
Listens to the tourist's voice (or typed text as backup), detects emergency type,
shows it on screen, sends it to the backend, and speaks a response back to the user.

## Emergency categories detected
- Unsafe situation
- Medical
- Accident
- Lost tourist
- Other

## Files you need
Copy this file into your project:
- `voice-emergency-demo/index.html` (contains all the logic, HTML, and styling)

## How to trigger the voice emergency feature from your app

### Option 1 (Simplest): Use the button already built
```html
<button id="sosBtn">🎤 PRESS FOR SOS</button>
```

### Option 2: Trigger it from YOUR OWN button/component
```javascript
startVoiceEmergency();
```
Example:
```html
<button onclick="startVoiceEmergency()">Emergency</button>
```

## Fallback text input (NEW)
If voice doesn't work, users can type instead. Include this in your page:
```html
<input type="text" id="textInput" placeholder="e.g. I am lost">
<button id="textSubmitBtn">Send</button>
```

## Required HTML elements
```html
<div id="status">Waiting...</div>
<div id="result">
  <p>You said: <span id="heardText"></span></p>
  <p>Detected Emergency: <span id="emergencyType"></span></p>
  <p>System Response: <span id="responseText"></span></p>
</div>
```
(Restyle freely — just keep the same `id` names)

## What data gets sent to the backend
```json
POST https://mocker-fasting-squealer.ngrok-free.dev/api/alerts
{
  "alert_type": "Unsafe situation",
  "tourist_id": "demo-tourist-001",
  "message": "I am in danger"
}
```
⚠️ Note: the backend URL is a temporary ngrok link from our backend teammate — it may change if their server restarts. Ask them for the latest link if this stops working.

## Browser requirement
⚠️ Must be tested in Google Chrome or Microsoft Edge (Web Speech API not supported in Firefox).

## Questions?
Contact: Abhineeth — branch: feature/ai-voice-emergency