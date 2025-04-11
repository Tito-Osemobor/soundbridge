import {createSelector, createSlice} from '@reduxjs/toolkit';
import {getPlatformById, SUPPORTED_PLATFORMS} from '@/constants/services';

const initialState = {
  connected: [], // [{ id: 'spotify', platformUserId: '...' }]
  pending: [],   // ['spotify', 'youtube']
};

const platformSlice = createSlice({
  name: 'platforms',
  initialState,
  reducers: {
    setConnectedPlatforms(state, action) {
      const connected = action.payload;
      const connectedIds = connected.map(p => p.id);

      state.connected = connected;
      state.pending = state.pending.filter(id => !connectedIds.includes(id)); // ✅ remove overlapping pending
    },
    addPendingConnection(state, action) {
      if (!state.pending.includes(action.payload)) {
        state.pending.push(action.payload);
      }
    },
    removePendingConnection(state, action) {
      state.pending = state.pending.filter(id => id !== action.payload);
    },
  },
});

// ✅ Actions you can dispatch from components
export const {
  setConnectedPlatforms,
  addPendingConnection,
  removePendingConnection,
} = platformSlice.actions;

// ✅ Selectors to read data from Redux
export const selectConnectedPlatforms = createSelector(
  (state) => state.platforms.connected,
  (state) => state.platforms.pending,
  (connected, pending) => [
    ...connected.map(p => ({
      ...getPlatformById(p.id),
      status: 'connected',
    })),
    ...pending.map(id => ({
      ...getPlatformById(id),
      status: 'pending',
    })),
  ]
);

const SUPPORTED_PLATFORMS_ARRAY = Array.from(SUPPORTED_PLATFORMS.values());
export const selectAvailablePlatforms = createSelector(
  (state) => state.platforms.connected,
  (state) => state.platforms.pending,
  () => SUPPORTED_PLATFORMS_ARRAY, // ✅ stable reference
  (connected, pending, supportedPlatforms) => {
    const allConnectedIds = [
      ...connected.map(p => p.id),
      ...pending,
    ];

    return supportedPlatforms.filter(
      (platform) => !allConnectedIds.includes(platform.id)
    );
  }
);

export default platformSlice.reducer;
