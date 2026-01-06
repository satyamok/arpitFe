import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:5454/api";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile?: string;
  role?: "user" | "admin" | "master";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

// Helper to get stored user
const getStoredUser = (): User | null => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: getStoredUser(),
  token: localStorage.getItem("token"),
  isLoading: false,
  error: null,
  isAuthenticated: !!localStorage.getItem("token"),
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    credentials: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Login failed");
      }
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const signup = createAsyncThunk(
  "auth/signup",
  async (
    userData: { name: string; email: string; mobile: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Signup failed");
      }
      localStorage.setItem("token", data.token);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const checkDocuments = createAsyncThunk(
  "auth/checkDocuments",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { auth: AuthState };
      const response = await fetch(`${API_BASE}/document`, {
        headers: {
          Authorization: `Bearer ${state.auth.token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to fetch documents");
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(signup.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
