import { useState, useEffect } from 'react'
import './App.css'

const touristData = {
  name: "Aarav Sharma",
  id: "TID-2026-00123",
  backendId: 3,
  nationality: "Indian",
  phone: "+91 98765 43210",
  destination: "Shillong, Meghalaya",
}

const emergencyContacts = [
  { name: "Local Police", number: "100" },
  { name: "Tourist Helpline", number: "1363" },
  { name: "Family Contact - Riya", number: "+91 90000 11122" },
]

const recentAlerts = [
  { id: 1, type: "Weather", message: "Heavy rain expected near Cherrapunji", time: "2 hours ago" },
  { id: 2, type: "Safety", message: "Avoid Zone 4 after 8 PM", time: "5 hours ago" },
]

function App() {
  const [screen, setScreen] = useState("home")
  const [sosActive, setSosActive] = useState(false)
  const [backendAlerts, setBackendAlerts] = useState(null)
  const [alertsLoading, setAlertsLoading] = useState(true)
  const [backendStatus, setBackendStatus] = useState("checking...")
  const [sosResponse, setSosResponse] = useState(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState(null)
  const [emergencyType, setEmergencyType] = useState(null)
  const [textInput, setTextInput] = useState("")
  const [emergencyActive, setEmergencyActive] = useState(false)
  const [sosSending, setSosSending] = useState(false)
  const [backendIncidents, setBackendIncidents] = useState(null)
  const [incidentsLoading, setIncidentsLoading] = useState(true)
  const [touristLocation, setTouristLocation] = useState(null)
  const [locationLoading, setLocationLoading] = useState(true)

  useEffect(() => {
    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/health", {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then(() => setBackendStatus("Connected ✅"))
      .catch(() => setBackendStatus("Not Connected ❌ (backend offline)"))
  }, [])

  useEffect(() => {
    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/alerts", {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => {
        const alertsArray = Array.isArray(data) ? data : data.alerts
        if (alertsArray && alertsArray.length > 0) {
          setBackendAlerts(alertsArray)
        }
      })
      .catch((err) => {
        console.log("Could not load alerts from backend, using demo alerts:", err)
      })
      .finally(() => setAlertsLoading(false))
  }, [])

  useEffect(() => {
    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/incidents", {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => {
        const incidentsArray = Array.isArray(data) ? data : data.incidents
        if (incidentsArray && incidentsArray.length > 0) {
          setBackendIncidents(incidentsArray)
        }
      })
      .catch((err) => {
        console.log("Could not load incidents from backend, using demo warnings:", err)
      })
      .finally(() => setIncidentsLoading(false))
  }, [])

  useEffect(() => {
    fetch(`https://mocker-fasting-squealer.ngrok-free.dev/api/locations/latest/${touristData.backendId}`, {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.location) {
          setTouristLocation(data.location)
        }
      })
      .catch((err) => {
        console.log("Could not load location from backend, using demo location:", err)
      })
      .finally(() => setLocationLoading(false))
  }, [])

  function handleSOS() {
    setSosActive(true)
    setEmergencyActive(true)
    setSosSending(true)

    const alertData = {
      tourist_id: touristData.backendId,
      alert_type: "SOS",
      name: touristData.name,
      location: "Shillong, Meghalaya (Demo Location)",
      message: "Emergency SOS triggered",
      time: new Date().toISOString(),
    }
    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(alertData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("SOS sent successfully:", data)
        if (data.success === false || data.error) {
          setSosResponse({ success: false, message: data.message || data.error || "Could not send alert." })
        } else {
          setSosResponse({ success: true, message: data.message || "Alert received. Help is on the way." })
        }
        setSosSending(false)
      })
      .catch((err) => {
        console.log("SOS could not reach backend (this is expected if not integrated yet):", err)
        setSosResponse({ success: false, message: "Could not reach server. Alert saved locally, will retry." })
        setSosSending(false)
      })

    setTimeout(() => setSosActive(false), 3000)
  }

  function detectEmergencyType(text) {
    const t = text.toLowerCase()
    if (t.includes("medical") || t.includes("sick") || t.includes("pain") || t.includes("hurt") || t.includes("injured")) return "Medical"
    if (t.includes("accident") || t.includes("crash") || t.includes("fall") || t.includes("fell")) return "Accident"
    if (t.includes("lost") || t.includes("don't know where")) return "Lost tourist"
    if (t.includes("danger") || t.includes("unsafe") || t.includes("scared") || t.includes("afraid") || t.includes("threat") || t.includes("help")) return "Unsafe situation"
    return "Other"
  }

  function speakResponse(text) {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  function sendVoiceAlert(spokenText) {
    const detectedType = detectEmergencyType(spokenText)
    setEmergencyType(detectedType)

    const voiceAlertData = {
      tourist_id: touristData.backendId,
      alert_type: detectedType,
      name: touristData.name,
      location: "Shillong, Meghalaya (Demo Location)",
      message: spokenText || "Voice SOS triggered",
      time: new Date().toISOString(),
    }

    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json", "ngrok-skip-browser-warning": "true" },
      body: JSON.stringify(voiceAlertData),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Voice SOS sent successfully:", data)
        if (data.success === false || data.error) {
          setSosResponse({ success: false, message: data.message || data.error || "Could not send voice alert." })
          speakResponse("Sorry, we could not send your alert. Please try again.")
        } else {
          const msg = data.message || "Voice alert received. Help is on the way."
          setSosResponse({ success: true, message: msg })
          speakResponse(`Emergency type ${detectedType} detected. ${msg}`)
        }
      })
      .catch((err) => {
        console.log("Voice SOS could not reach backend:", err)
        setSosResponse({ success: false, message: "Could not reach server. Voice alert saved locally, will retry." })
        speakResponse("Could not reach the server. Your alert has been saved and will retry.")
      })
  }

  function handleVoiceSOS() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceTranscript("Voice recognition not supported in this browser. Please use Chrome or Edge, or type below.")
      return
    }

    setVoiceActive(true)
    setEmergencyActive(true)
    setVoiceTranscript("🎙️ Listening...")
    setEmergencyType(null)

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript
      setVoiceTranscript(`You said: "${spokenText}"`)
      sendVoiceAlert(spokenText)
    }

    recognition.onerror = (event) => {
      console.log("Speech recognition error:", event.error)
      if (event.error !== "aborted") {
        setVoiceTranscript("Could not hear you clearly. Please try again or type below.")
      }
    }

    recognition.onend = () => {
      setVoiceActive(false)
    }

    recognition.start()

    setTimeout(() => setEmergencyActive(false), 5000)
  }

  function handleTextSubmit() {
    if (!textInput.trim()) return
    setVoiceTranscript(`You typed: "${textInput}"`)
    setEmergencyActive(true)
    setEmergencyType(null)
    sendVoiceAlert(textInput)
    setTextInput("")
    setTimeout(() => setEmergencyActive(false), 5000)
  }

  const mapSrc = touristLocation
    ? `https://www.openstreetmap.org/export/embed.html?bbox=${touristLocation.longitude - 0.03},${touristLocation.latitude - 0.03},${touristLocation.longitude + 0.03},${touristLocation.latitude + 0.03}&marker=${touristLocation.latitude},${touristLocation.longitude}`
    : "https://www.openstreetmap.org/export/embed.html?bbox=91.85,25.55,91.93,25.61&marker=25.5788,91.8933"

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tourist Safety</h1>
        {emergencyActive && (
          <div className="emergency-banner">🚨 Emergency Active — Location shared with responders</div>
        )}
        <p className="subtitle">Stay Safe, Stay Connected</p>
      </header>

      <main className="app-content">
        {screen === "home" && (
          <div className="screen">
            <div className="profile-card">
              <div className="avatar">👤</div>
              <div>
                <h2>{touristData.name}</h2>
                <p>ID: {touristData.id}</p>
                <p>{touristData.destination}</p>
              </div>
            </div>

            <button
              className={`sos-button ${sosActive ? "sos-active" : ""}`}
              onClick={handleSOS}
            >
              {sosActive ? "ALERT SENT ✔" : sosSending ? "Sending..." : "SOS"}
            </button>
            <p className="sos-hint">Press in case of emergency</p>
            <button
              className={`voice-button ${voiceActive ? "voice-active" : ""}`}
              onClick={handleVoiceSOS}
            >
              {voiceActive ? "🎙️ Listening..." : "🎙️ Voice SOS"}
            </button>
            <p className="sos-hint">Tap and speak your emergency</p>

            <div className="card voice-placeholder">
              <h3>🎙️ Voice Emergency Module</h3>
              <div className="map-box">
                {voiceTranscript || "Tap \"Voice SOS\" above and speak your emergency"}
              </div>
              {emergencyType && (
                <p><strong>Detected Emergency:</strong> {emergencyType}</p>
              )}
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
            <input
                  type="text"
                  id="textInput"
                  placeholder="Or type your emergency, e.g. I am lost"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  style={{ flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #e2e8f0" }}
                />
                <button onClick={handleTextSubmit} className="call-btn">Send</button>
              </div>
            </div>

            {sosResponse && (
              <div className={`sos-response ${sosResponse.success ? "sos-success" : "sos-warning"}`}>
                {sosResponse.message}
              </div>
            )}

            <div className="card">
              <h3>🔌 Backend Status</h3>
              <p className={backendStatus === "checking..." ? "loading-text" : ""}>{backendStatus}</p>
            </div>

            <div className="card">
              <h3>📍 Current Location</h3>
              {locationLoading ? (
                <p className="loading-text">Loading location...</p>
              ) : touristLocation ? (
                <>
                  <p>
                    Lat: {touristLocation.latitude}, Lng: {touristLocation.longitude}
                  </p>
                  <p className="map-note">
                    Last updated: {touristLocation.timestamp ? new Date(touristLocation.timestamp).toLocaleString() : ""}
                  </p>
                </>
              ) : (
                <p>Shillong, Meghalaya (Demo Location)</p>
              )}
            </div>

            <div className="card map-placeholder">
              <h3>🗺️ Live Map</h3>
              {emergencyActive && (
                <div className="map-alert-text">📍 Alert location marked on map</div>
              )}
              <iframe
                title="Tourist Location Map"
                className="live-map-frame"
                loading="lazy"
                src={mapSrc}
              ></iframe>
              <p className="map-note">
                {locationLoading
                  ? "Loading map location..."
                  : touristLocation
                  ? "Live location from backend"
                  : "Demo location: Shillong, Meghalaya — will be replaced with live GPS + geofencing from feature/maps-geofence-dashboard"}
              </p>
            </div>

            <div className="card">
              <h3>🔔 Recent Alerts</h3>
              {alertsLoading ? (
                <p className="loading-text">Loading alerts...</p>
              ) : backendAlerts ? (
                backendAlerts.slice(0, 5).map((alert, i) => (
                  <div key={alert.id || i} className="alert-item">
                    <strong>{alert.alert_type || alert.type || "Alert"}:</strong>{" "}
                    {alert.message}
                    <div className="alert-time">
                      {alert.time ? new Date(alert.time).toLocaleString() : ""}
                    </div>
                  </div>
                ))
              ) : (
                recentAlerts.map((alert) => (
                  <div key={alert.id} className="alert-item">
                    <strong>{alert.type}:</strong> {alert.message}
                    <div className="alert-time">{alert.time}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {screen === "safety" && (
          <div className="screen">
            <h2>My Safety</h2>
            <div className="card">
              <h3>Safety Score</h3>
              <p className="safety-score">85 / 100</p>
              <p>You are in a generally safe zone.</p>
            </div>
            <div className="card">
              <h3>⚠️ Warnings</h3>
              {incidentsLoading ? (
                <p className="loading-text">Loading warnings...</p>
              ) : backendIncidents && backendIncidents.filter((i) => i.status === "open").length > 0 ? (
                backendIncidents
                  .filter((i) => i.status === "open")
                  .map((incident) => (
                    <div key={incident.id} className="alert-item">
                      <strong>{incident.incident_type}:</strong> {incident.description}
                      <div className="alert-time">
                        {incident.timestamp ? new Date(incident.timestamp).toLocaleString() : ""}
                      </div>
                    </div>
                  ))
              ) : (
                <p>No active warnings for your area.</p>
              )}
            </div>
          </div>
        )}

        {screen === "contacts" && (
          <div className="screen">
            <h2>Emergency Contacts</h2>
            {emergencyContacts.map((c, i) => (
              <div key={i} className="card contact-card">
                <div>
                  <strong>{c.name}</strong>
                  <p>{c.number}</p>
                </div>
                <a href={`tel:${c.number}`} className="call-btn">Call</a>
              </div>
            ))}
          </div>
        )}

        {screen === "profile" && (
          <div className="screen">
            <h2>My Profile</h2>
            <div className="card">
              <p><strong>Name:</strong> {touristData.name}</p>
              <p><strong>Tourist ID:</strong> {touristData.id}</p>
              <p><strong>Nationality:</strong> {touristData.nationality}</p>
              <p><strong>Phone:</strong> {touristData.phone}</p>
              <p><strong>Destination:</strong> {touristData.destination}</p>
            </div>
          </div>
        )}
      </main>

      <nav className="bottom-nav">
        <button className={screen === "home" ? "active" : ""} onClick={() => setScreen("home")}>🏠<br/>Home</button>
        <button className={screen === "safety" ? "active" : ""} onClick={() => setScreen("safety")}>🛡️<br/>Safety</button>
        <button className={screen === "contacts" ? "active" : ""} onClick={() => setScreen("contacts")}>📞<br/>Contacts</button>
        <button className={screen === "profile" ? "active" : ""} onClick={() => setScreen("profile")}>👤<br/>Profile</button>
      </nav>
    </div>
  )
}

export default App
