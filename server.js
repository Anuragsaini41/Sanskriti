require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const fs = require('fs');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 3000;

// ✅ Default DB for login/signup (test)
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB: test'))
  .catch(err => console.log('❌ MongoDB connection error (test):', err));

// ✅ Secondary DB for posts (Socialmedia)
const socialmediaDB = mongoose.createConnection(process.env.MONGODB_SOCIAL_URI);

// Log secondary connection status
socialmediaDB.on('connected', () => {
  console.log('✅ Connected to MongoDB: Socialmedia');
});

socialmediaDB.on('error', (err) => {
  console.log('❌ MongoDB connection error (Socialmedia):', err);
});

// ✅ Import Post model using Socialmedia DB
const PostModel = require('./models/Post')(socialmediaDB);

// ✅ Middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/data', express.static(path.join(__dirname, 'data')));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// ✅ Debugging middleware to capture errors
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    console.log(`Response for ${req.method} ${req.url}: Status ${res.statusCode}`);
    return originalSend.call(this, data);
  };
  next();
});

// ✅ Routes
app.use('/', authRoutes);

// ✅ Import and use social media routes
const socialRoutes = require('./routes/socialroutes')(PostModel);
app.use('/api', socialRoutes);

// Special route to handle uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'public/img/social-media')));

app.listen(port, () => {
  console.log(`🚀 Server is running at http://localhost:${port}`);
});
