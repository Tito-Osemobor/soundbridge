import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

import {FRONTEND_URL, PORT} from "./src/config/applicationConfig.js";
import {errorHandler} from './src/middleware/errorHandler.js';

import authRoutes from './src/routes/authRoutes.js';
import oauthRoutes from './src/routes/oauthRoutes.js';
import spotifyRoutes from './src/routes/spotifyRoutes.js';
import transferRoutes from './src/routes/transferRoutes.js';


const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors(
  {
    origin: FRONTEND_URL,
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
