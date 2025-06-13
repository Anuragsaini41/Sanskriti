const express = require('express');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs'); // File system module for deleting files

// Setup nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'anuragsaini4141@gmail.com',
    pass: 'hvjk lxfl vcto qixp'  // ✅ App Password (safe for testing, rotate if deploying)
  }
});

// Generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../public/uploads')); // Save images in the "uploads" folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
  }
});

const upload = multer({ storage });

// Step 1: Send OTP and temporarily store hashed password, OTP, and expiry
router.post('/send-otp', async (req, res) => {
  const { username, email, password, fullName, phone, dob, gender, country, state, city, pincode } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).send('User already exists with this email.');

    const otp = generateOTP();
    const otpExpiry = Date.now() + 5 * 60 * 1000; // OTP expiry time is 5 minutes
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      fullName,
      phone,
      dob,
      gender,
      country,
      state,
      city,
      pincode,
      otp,
      otpExpiry
    });

    await newUser.save();

    await transporter.sendMail({
      from: 'anuragsaini4141@gmail.com',
      to: email,
      subject: 'Sanskriti Signup OTP',
      text: `Your OTP for registration is: ${otp}`
    });

    res.status(200).send('OTP sent to email!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error sending OTP');
  }
});

// Step 2: Verify OTP and finalize signup
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || user.otp !== otp) return res.status(400).send('Invalid OTP');
    if (Date.now() > user.otpExpiry) return res.status(400).send('OTP expired');

    user.otp = undefined;
    user.otpExpiry = undefined;
    await user.save();

    res.status(200).send('Signup successful!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error during OTP verification');
  }
});

// Step 3: Login with email and password, return username
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).send('User not found');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).send('Invalid password');

    // ✅ Return username to frontend
    res.status(200).json({ message: 'Login successful!', username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login error');
  }
});

router.get('/user/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select('-password -otp -otpExpiry');
    if (!user) return res.status(404).send('User not found');
    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Endpoint to upload profile image
router.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
  const { username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    // Check if user already has a profile image
    if (user.profileImage) {
      const oldImagePath = path.join(__dirname, '../public', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath); // Delete the old image
      }
    }

    // Save the new image path in the database
    user.profileImage = `/uploads/${req.file.filename}`;
    await user.save();

    res.status(200).json({ message: 'Profile image updated successfully', profileImage: user.profileImage });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error uploading profile image');
  }
});

// Endpoint to update user details
router.put('/update-profile', async (req, res) => {
  const { username, fullName, email, phone, city, state, country } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).send('User not found');

    // Update user details
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.city = city || user.city;
    user.state = state || user.state;
    user.country = country || user.country;

    await user.save();
    res.status(200).send('Profile updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error updating profile');
  }
});

module.exports = router;
