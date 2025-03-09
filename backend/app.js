require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth/authRoutes');
const spotifyAuthRoutes = require('./src/routes/auth/spotifyAuthRoutes');
const spotifyRoutes = require('./src/routes/spotifyRoutes');
const appleAuthRoutes = require('./src/routes/auth/appleAuthRoutes');
const youtubeAuthRoutes = require('./src/routes/auth/youtubeAuthRoutes');

const {errorHandler} = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: process.env.CLIENT_URL,
    credentials: true
  }
));

// Routes
app.use('/auth', authRoutes);
app.use('/auth/spotify', spotifyAuthRoutes);
app.use('/auth/apple', appleAuthRoutes);
app.use('/auth/youtube', youtubeAuthRoutes);
app.use('/api/spotify', spotifyRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('🎵 SoundBridge Backend is running!');
});

app.use(errorHandler)

// Start Server
app.listen(PORT, () => {
  console.log(`✅  Server is running on port ${PORT}`);
});
