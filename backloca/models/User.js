// models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  entreprise: { type: String, required: true },
  number: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },        // new field
  logoEntreprise: { type: String },                 // URL or path to logo
  country: { type: String },                        // new field
  city: { type: String },                           // new field
  status: { type: String, enum: ['pending','approved','rejected'], default: 'pending' },
  ip: { type: String },                             // IP address of demande
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

