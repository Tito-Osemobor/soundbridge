import { configureStore } from '@reduxjs/toolkit';
import platformReducer from './platformSlice';
import playlistsReducer from './playlistsSlice';

const store = configureStore({
  reducer: {
    platforms: platformReducer,
    playlists: playlistsReducer,
  },
});

export default store;
