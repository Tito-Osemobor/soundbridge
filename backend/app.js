import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import authRoutes from './src/routes/auth/authRoutes.js';
import oauthRoutes from './src/routes/auth/oauthRoutes.js';
import spotifyRoutes from './src/routes/spotifyRoutes.js';
import transferRoutes from './src/routes/transferRoutes.js';


import {errorHandler} from './src/middleware/errorHandler.js';

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
app.use('/oauth', oauthRoutes);
app.use('/api/spotify', spotifyRoutes);
app.use('/api/transfer', transferRoutes);

// Test Route
app.get('/', (req, res) => {
  res.send('🎵 SoundBridge Backend is running!');
});

app.use(errorHandler)

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
