const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  dob: { type: Date },
  gender: { type: String },
  country: { type: String },
  state: { type: String },
  city: { type: String },
  pincode: { type: String },
  profileImage: { type: String }, // Path to the profile image
  otp: { type: String },
  otpExpiry: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
