import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:5454/api";

interface PanCard {
  _id: string;
  user: string;
  panCardName: string;
  panCardNumber: string;
  createdAt: string;
  updatedAt: string;
}

interface PancardState {
  pancards: PanCard[];
  isLoading: boolean;
  error: string | null;
  hasData: boolean | null;
}

const initialState: PancardState = {
  pancards: [],
  isLoading: false,
  error: null,
  hasData: null,
};

export const fetchPancards = createAsyncThunk(
  "pancard/fetchPancards",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/pancard`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch pancards");
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const addPancard = createAsyncThunk(
  "pancard/addPancard",
  async (
    pancardData: { panCardName: string; panCardNumber: string },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/pancard`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(pancardData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add pancard");
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

const pancardSlice = createSlice({
  name: "pancard",
  initialState,
  reducers: {
    clearPancardError: (state) => {
      state.error = null;
    },
    resetPancardState: (state) => {
      state.pancards = [];
      state.hasData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPancards.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPancards.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pancards = action.payload.data || [];
        state.hasData = (action.payload.data?.length || 0) > 0;
      })
      .addCase(fetchPancards.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.hasData = false;
      })
      .addCase(addPancard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(addPancard.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.pancards.push(action.payload.data);
        }
        state.hasData = true;
      })
      .addCase(addPancard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearPancardError, resetPancardState } = pancardSlice.actions;
export default pancardSlice.reducer;
