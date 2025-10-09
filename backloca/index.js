// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.set('trust proxy', true); // important if behind a proxy

// Get public IP of the client: prefer headers (X-Forwarded-For), else we'll fetch server-seen public IP
function getRequestIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  if (req.headers['x-real-ip']) return req.headers['x-real-ip'];
  // When called from the same machine it will be localhost; we'll handle by fetching public ip below
  let ip = req.ip || req.socket?.remoteAddress || null;
  if (!ip) return null;
  if (ip.startsWith('::ffff:')) ip = ip.split(':').pop();
  if (ip === '::1') ip = '127.0.0.1';
  return ip;
}

async function fetchPublicIp() {
  // Use ipify to get the server-visible public IP (useful in dev)
  const res = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
  return res.data.ip;
}

async function ipGeolocate(ip) {
  // ipapi.co returns city, region, latitude, longitude etc.
  const url = ip && ip !== '127.0.0.1' ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
  const res = await axios.get(url, { timeout: 5000 });
  return res.data;
}

async function reverseGeocode(lat, lon) {
  // Nominatim reverse geocoding (OpenStreetMap). Set a sensible User-Agent to respect usage policy.
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
  const res = await axios.get(url, {
    timeout: 5000,
    headers: { 'User-Agent': 'locaconnector/1.0 (your-email@example.com)' }
  });
  return res.data; // includes display_name and address object
}

app.get('/whoami/place', async (req, res) => {
  try {
    let ip = getRequestIp(req);

    // If the request comes from localhost (127.0.0.1) or ::1, fetch public IP (dev case)
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      ip = await fetchPublicIp();
    }

    const geo = await ipGeolocate(ip);

    // If geo lookup failed or has no coords, return what we have
    const lat = geo.latitude ?? geo.lat ?? null;
    const lon = geo.longitude ?? geo.lon ?? null;

    let place = null;
    if (lat && lon) {
      try {
        const rev = await reverseGeocode(lat, lon);
        // rev.display_name is the human readable full place name
        place = {
          display_name: rev.display_name,
          address: rev.address || null
        };
      } catch (e) {
        // reverse geocode failed — ignore but keep ip geo result
        place = { error: 'Reverse geocoding failed', details: e.message };
      }
    }

    res.json({
      ip,
      geolocation: geo,
      place
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
