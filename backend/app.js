require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth/authRoutes');
const spotifyRoutes = require('./src/routes/spotifyRoutes');
const connectRoutes = require('./src/routes/auth/connectRoutes');
const transferRoutes = require('./src/routes/transferRoutes');


const {errorHandler} = require("./src/middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: process.env.FRONTEND_DEV_URL,
    credentials: true,
  }
));

// Routes
app.use('/auth', authRoutes);
app.use('/auth/connect', connectRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/transfer', transferRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('🎵 SoundBridge Backend is running!');
});

app.use(errorHandler)

// Start Server
app.listen(PORT, () => {
  console.log(`✅  Server is running on port ${PORT}`);
});
