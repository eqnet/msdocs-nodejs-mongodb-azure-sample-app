const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  url: { type: String, required: true },
  ipAddress: String,
  ipAddresses: Array,
  createdAt: Date,
  updatedAt: Date,
});

module.exports = mongoose.model('User', userSchema);
