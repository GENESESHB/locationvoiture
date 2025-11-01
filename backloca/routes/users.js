const express = require('express');
const router = express.Router();
const User = require('../models/User');
const upload = require('../config/cloudinary'); // ✅ use Cloudinary upload instead of local multer

// 📤 Partner Registration Route
router.post('/demande', upload.single('logoEntreprise'), async (req, res) => {
  try {
    const { name, entreprise, number, email, password, country, city } = req.body;
    const logoEntreprise = req.file ? req.file.path : ''; // ✅ Cloudinary gives a hosted URL

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    // Create new user
    const newUser = new User({
      name,
      entreprise,
      number,
      email,
      password,
      logoEntreprise,
      country,
      city,
      ip: req.ip
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: 'Demande submitted successfully! Waiting for admin approval.',
      user: newUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 🕓 Admin lists pending demandes
router.get('/pending', async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: 'pending' });
    res.json({ success: true, pendingUsers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Admin approves a user
router.put('/approve/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'approved' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User approved', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ❌ Admin rejects a user
router.put('/reject/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected' },
      { new: true }
    );
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User rejected', user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;

