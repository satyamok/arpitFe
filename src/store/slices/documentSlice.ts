import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

const API_BASE = "http://localhost:5454/api";

interface PanCard {
  _id: string;
  panCardName: string;
  panCardNumber: string;
}

interface Document {
  _id: string;
  user: string;
  documentName: string;
  panCard: PanCard;
  documentUrl: string;
  aboutDocument: string;
  createdAt: string;
  updatedAt: string;
}

interface DocumentState {
  documents: Document[];
  isLoading: boolean;
  isAdding: boolean;
  error: string | null;
}

const initialState: DocumentState = {
  documents: [],
  isLoading: false,
  isAdding: false,
  error: null,
};

export const fetchDocuments = createAsyncThunk(
  "document/fetchDocuments",
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/document`, {
        headers: {
          Authorization: `Bearer ${token}`,
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

export const addDocument = createAsyncThunk(
  "document/addDocument",
  async (
    documentData: {
      documentName: string;
      panCard: string;
      documentUrl: string;
      aboutDocument: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE}/document`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(documentData),
      });
      const data = await response.json();
      if (!response.ok) {
        return rejectWithValue(data.message || "Failed to add document");
      }
      return data;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

const documentSlice = createSlice({
  name: "document",
  initialState,
  reducers: {
    clearDocumentError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.documents = action.payload.data || [];
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(addDocument.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addDocument.fulfilled, (state) => {
        state.isAdding = false;
      })
      .addCase(addDocument.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearDocumentError } = documentSlice.actions;
export default documentSlice.reducer;
