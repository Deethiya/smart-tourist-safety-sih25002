# How to Add the Safety Map to Your App

This map (built by Merlin) shows tourist location, safe/danger zones, and sends
geofence alerts to the backend. Here's how to add it to your part of the app.

## Files you need
Copy these 2 files from the `maps-geofence-dashboard` folder:
- `index.html` (or just copy the `<div id="map"></div>` + `<script>` parts into your own HTML)
- `app.js`

## Option A: If your app is Plain HTML/JS

1. Copy `app.js` into your project folder.
2. In your HTML file, add these lines inside `<head>`:
```html
   <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
```
3. Add this where you want the map to appear:
```html
   <div id="map" style="height: 500px; width: 100%;"></div>
```
4. Add these lines just before `</body>`:
```html
   <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
   <script src="app.js"></script>
```
5. Also add this (needed for the dashboard status box):
```html
   <div id="dashboard">
     <div id="status">Status: SAFE</div>
   </div>
```

## Option B: If your app is React

1. Install Leaflet:
