// index.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const userRoutes = require('./routes/userRoutes');
const usersRoutes = require('./routes/users');
const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json()); // Parse JSON in POST requests
app.set('trust proxy', true); // Important if behind a proxy

// --------------------
// MongoDB Connection
// --------------------
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/wegorent', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// --------------------
// Helper Functions
// --------------------
function getRequestIp(req) {
  const xff = req.headers['x-forwarded-for'];
  if (xff) return xff.split(',')[0].trim();
  if (req.headers['x-real-ip']) return req.headers['x-real-ip'];

  let ip = req.ip || req.socket?.remoteAddress || null;
  if (!ip) return null;
  if (ip.startsWith('::ffff:')) ip = ip.split(':').pop();
  if (ip === '::1') ip = '127.0.0.1';
  return ip;
}

async function fetchPublicIp() {
  const res = await axios.get('https://api.ipify.org?format=json', { timeout: 5000 });
  return res.data.ip;
}

async function ipGeolocate(ip) {
  const url = ip && ip !== '127.0.0.1' ? `https://ipapi.co/${ip}/json/` : 'https://ipapi.co/json/';
  const res = await axios.get(url, { timeout: 5000 });
  return res.data;
}

async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&addressdetails=1`;
  const res = await axios.get(url, {
    timeout: 5000,
    headers: { 'User-Agent': 'locaconnector/1.0 (your-email@example.com)' }
  });
  return res.data;
}

// --------------------
// Routes
// --------------------

// 🌍 Get user location info
app.get('/whoami/place', async (req, res) => {
  try {
    let ip = getRequestIp(req);
    if (!ip || ip === '127.0.0.1' || ip === '::1') {
      ip = await fetchPublicIp();
    }

    const geo = await ipGeolocate(ip);
    const lat = geo.latitude ?? geo.lat ?? null;
    const lon = geo.longitude ?? geo.lon ?? null;

    let place = null;
    if (lat && lon) {
      try {
        const rev = await reverseGeocode(lat, lon);
        place = {
          display_name: rev.display_name,
          address: rev.address || null
        };
      } catch (e) {
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

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 👤 User routes
app.use('/users', usersRoutes); // For registration etc.
app.use('/api/user', userRoutes); // For user controller routes
app.use('/api/auth', authRoutes);

// --------------------
// Start Server
// --------------------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));
