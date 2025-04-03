import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { RootState } from "../store";

export interface StorageState {
  loading: boolean;
  error: string | null;
  signedUrl: string | null;
  uploadUrl: string | null;
  token: string | null;
}

const initialState: StorageState = {
  loading: false,
  error: null,
  signedUrl: null,
  uploadUrl: null,
  token: null,
};

// Create a signed upload URL
export const getSignedUploadUrl = createAsyncThunk(
  "storage/getSignedUploadUrl",
  async (
    { bucket, path }: { bucket: string; path: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch("/api/storage/signed-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ bucket, path }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || "Failed to get signed URL");
      }

      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

// Upload a file using the signed URL
export const uploadToSignedUrl = createAsyncThunk(
  "storage/uploadToSignedUrl",
  async (
    {
      signedUrl,
      file,
      token,
    }: { signedUrl: string; file: File; token: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await fetch(signedUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-upsert": "true",
        },
        body: file,
      });

      if (!response.ok) {
        return rejectWithValue("Failed to upload file");
      }

      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : "Unknown error occurred"
      );
    }
  }
);

const storageSlice = createSlice({
  name: "storage",
  initialState,
  reducers: {
    clearStorageState: (state) => {
      state.signedUrl = null;
      state.uploadUrl = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Get signed URL
      .addCase(getSignedUploadUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSignedUploadUrl.fulfilled, (state, action) => {
        state.loading = false;
        state.signedUrl = action.payload.signedUrl;
        state.uploadUrl = action.payload.path;
        state.token = action.payload.token;
      })
      .addCase(getSignedUploadUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload to signed URL
      .addCase(uploadToSignedUrl.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadToSignedUrl.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(uploadToSignedUrl.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearStorageState } = storageSlice.actions;

export const selectStorageLoading = (state: RootState) => state.storage.loading;
export const selectStorageError = (state: RootState) => state.storage.error;
export const selectSignedUrl = (state: RootState) => state.storage.signedUrl;
export const selectUploadUrl = (state: RootState) => state.storage.uploadUrl;
export const selectToken = (state: RootState) => state.storage.token;

export default storageSlice.reducer;
