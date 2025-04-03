import {
  createSlice,
  createAsyncThunk,
  createSelector,
} from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios from "axios";

export interface StorageState {
  status: "idle" | "loading" | "succeeded" | "failed";
  signedUrl: string | null;
  uploadUrl: string | null;
  token: string | null;
}

const initialState: StorageState = {
  status: "idle",
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
      const response = await axios.post("/api/storage/signed-url", {
        bucket,
        path,
      });

      if (response.status !== 200) {
        return rejectWithValue(
          response.data.error || "Failed to get signed URL"
        );
      }

      console.log("response", response.data);

      return response.data;
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
      const response = await axios.put(signedUrl, file, {
        headers: {
          "Content-Type": file.type,
          "x-upsert": "true",
        },
      });

      if (response.status !== 200) {
        return rejectWithValue("Failed to upload file");
      }

      return response.data;
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
      state.status = "idle";
    },
  },
  extraReducers: (builder) => {
    builder
      // Get signed URL
      .addCase(getSignedUploadUrl.pending, (state) => {
        state.status = "loading";
      })
      .addCase(getSignedUploadUrl.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.signedUrl = action.payload.signedUrl;
        state.uploadUrl = action.payload.path;
        state.token = action.payload.token;
      })
      .addCase(getSignedUploadUrl.rejected, (state, action) => {
        state.status = "failed";
      })
      // Upload to signed URL
      .addCase(uploadToSignedUrl.pending, (state) => {
        state.status = "loading";
      })
      .addCase(uploadToSignedUrl.fulfilled, (state) => {
        state.status = "succeeded";
      })
      .addCase(uploadToSignedUrl.rejected, (state, action) => {
        state.status = "failed";
      });
  },
});

export const { clearStorageState } = storageSlice.actions;

export const selectStorageLoading = createSelector(
  (state: RootState) => state.storage.status,
  (status) => status === "loading"
);
export const selectStorageError = createSelector(
  (state: RootState) => state.storage.status,
  (status) => status === "failed"
);
export const selectSignedUrl = createSelector(
  (state: RootState) => state.storage.signedUrl,
  (signedUrl) => signedUrl
);
export const selectUploadUrl = createSelector(
  (state: RootState) => state.storage.uploadUrl,
  (uploadUrl) => uploadUrl
);
export const selectToken = createSelector(
  (state: RootState) => state.storage.token,
  (token) => token
);

export default storageSlice.reducer;
