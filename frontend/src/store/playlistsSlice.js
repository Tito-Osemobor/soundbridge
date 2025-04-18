import {createAsyncThunk, createSlice} from "@reduxjs/toolkit";
import {loadUserPlaylists} from "@/services/playlists";
import {resetApp} from "@/store/globalActions";

const initialState = {
  byPlatform: {},
  loading: false,
  error: null,
};

export const fetchPlaylistsForPlatform = createAsyncThunk(
  'playlists/fetchForPlatform',
  async ({platformId, platformUserId}) => {
    const playlists = await loadUserPlaylists(platformId, platformUserId);
    return {platformId, playlists};
  }
)

const playlistsSlice = createSlice({
  name: 'playlists',
  initialState,
  reducers: {
    setPlaylistsForPlatform: (state, action) => {
      const {platformId, playlists} = action.payload;
      state.byPlatform[platformId] = playlists;
    },
    appendPlaylistsForPlatform: (state, action) => {
      const {platformId, playlists} = action.payload;
      state.byPlatform[platformId] = [
        ...(state.byPlatform[platformId] || []),
        ...playlists,
      ];
    },
    removePlaylistsForPlatform: (state, action) => {
      const platformId = action.payload;
      delete state.byPlatform[platformId];
    },
    resetPlaylists: (state) => {
      state.byPlatform = {};
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPlaylistsForPlatform.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPlaylistsForPlatform.fulfilled, (state, action) => {
        const { platformId, playlists } = action.payload;
        state.byPlatform[platformId] = playlists;
        state.loading = false;
      })
      .addCase(fetchPlaylistsForPlatform.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      .addCase(resetApp, () => initialState);
  },
});

export const {
  setPlaylistsForPlatform,
  appendPlaylistsForPlatform,
  resetPlaylists,
  removePlaylistsForPlatform,
} = playlistsSlice.actions;

export const selectPlaylistsByPlatform = (state) => state.playlists.byPlatform;

export const selectAllPlaylists = (state) =>
  Object.values(state.playlists.byPlatform).flat();

export default playlistsSlice.reducer;
