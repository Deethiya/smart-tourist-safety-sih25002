import { useState, useEffect } from 'react'
import './App.css'

const touristData = {
  name: "Aarav Sharma",
  id: "TID-2026-00123",
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
  const [backendStatus, setBackendStatus] = useState("checking...")
  const [sosResponse, setSosResponse] = useState(null)
  const [voiceActive, setVoiceActive] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState(null)
  const [emergencyActive, setEmergencyActive] = useState(false)
 const [sosSending, setSosSending] = useState(false) 
 const [backendIncidents, setBackendIncidents] = useState(null)
 


  useEffect(() => {
    fetch("https://mocker-fasting-squealer.ngrok-free.dev/api/health", {
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => res.json())
      .then((data) => setBackendStatus("Connected ✅"))
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
   }, [])

function handleSOS() {
    setSosActive(true)
    setEmergencyActive(true)
    setSosSending(true)

    const alertData = {
tourist_id: touristData.id,
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
        setSosResponse({ success: true, message: data.message || "Alert received. Help is on the way." })
        setSosSending(false)
      })
      .catch((err) => {
        console.log("SOS could not reach backend (this is expected if not integrated yet):", err)
        setSosResponse({ success: false, message: "Could not reach server. Alert saved locally, will retry." })
        setSosSending(false)
      })

    setTimeout(() => setSosActive(false), 3000)
    }
function handleVoiceSOS() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setVoiceTranscript("Voice recognition not supported in this browser. Please use Chrome.")
      return
    }

    setVoiceActive(true)
    setEmergencyActive(true)
    setVoiceTranscript("🎙️ Listening...")

    const recognition = new SpeechRecognition()
    recognition.lang = "en-IN"
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript

      setVoiceTranscript(`You said: "${spokenText}"`)

      const voiceAlertData = {
        tourist_id: touristData.id,
        alert_type: "voice",
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
          setSosResponse({ success: true, message: data.message || "Voice alert received. Help is on the way." })
        })
        .catch((err) => {
          console.log("Voice SOS could not reach backend:", err)
          setSosResponse({ success: false, message: "Could not reach server. Voice alert saved locally, will retry." })
        })
    }

    recognition.onerror = (event) => {
     console.log("Speech recognition error:", event.error)
     if (event.error !== "aborted") {
       setVoiceTranscript("Could not hear you clearly. Please try again.")
     }
   }

    recognition.onend = () => {
      setVoiceActive(false)
    }

    recognition.start()

    setTimeout(() => setEmergencyActive(false), 5000)
  }

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
            </div>

            {sosResponse && (
              <div className={`sos-response ${sosResponse.success ? "sos-success" : "sos-warning"}`}>
                {sosResponse.message}
              </div>
            )}

            <div className="card">
              <h3>🔌 Backend Status</h3>
              <p>{backendStatus}</p>
            </div>
            <div className="card">
     <h3>📍 Current Location</h3>
     <p>Shillong, Meghalaya (Demo Location)</p>
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
                src="https://www.openstreetmap.org/export/embed.html?bbox=91.85,25.55,91.93,25.61&marker=25.5788,91.8933"
              ></iframe>
              <p className="map-note">
                Demo location: Shillong, Meghalaya — will be replaced with live GPS + geofencing from feature/maps-geofence-dashboard
              </p>
            </div>

<div className="card">
              <h3>🔔 Recent Alerts</h3>
              {backendAlerts
                ? backendAlerts.slice(0, 5).map((alert, i) => (
                    <div key={alert.id || i} className="alert-item">
                      <strong>{alert.alert_type || alert.type || "Alert"}:</strong>{" "}
                      {alert.message}
                      <div className="alert-time">
                        {alert.time ? new Date(alert.time).toLocaleString() : ""}
                      </div>
                    </div>
                  ))
                : recentAlerts.map((alert) => (
                    <div key={alert.id} className="alert-item">
                      <strong>{alert.type}:</strong> {alert.message}
                      <div className="alert-time">{alert.time}</div>
                    </div>
                  ))}
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
                {backendIncidents && backendIncidents.filter((i) => i.status === "open").length > 0 ? (
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
