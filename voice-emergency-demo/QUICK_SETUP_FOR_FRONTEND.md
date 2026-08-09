# Quick Setup — Add Voice Emergency to Your App (Plain HTML)

## Step 1: Copy 2 things into your project
1. Copy the entire `<script>...</script>` block from `voice-emergency-demo/index.html` into your own HTML file (just before `</body>`)
2. Copy these HTML elements into your page (can be hidden/styled however you like):

```html
<div id="status">Waiting...</div>
<div id="result" style="display:none;">
  <p>You said: <span id="heardText"></span></p>
  <p>Detected Emergency: <span id="emergencyType"></span></p>
  <p>System Response: <span id="responseText"></span></p>
</div>
<input type="text" id="textInput" placeholder="e.g. I am lost">
<button id="textSubmitBtn">Send</button>
```

## Step 2: Add your own emergency button anywhere in your app
```html
<button onclick="startVoiceEmergency()">🎤 SOS</button>
```

## Step 3: Test it
- Open your page in Chrome
- Click your emergency button
- Say "I am in danger"
- You should see the result appear and hear a spoken response

## That's it! No extra setup needed.

Questions? Contact: Abhineeth — branch: feature/ai-voice-emergency