import {
  getSignedUploadUrl,
  uploadToSignedUrl,
  selectStorageError,
} from "@/lib/redux/slices/storageSlice";
import { AppDispatch, useAppSelector } from "@/lib/redux/store";

/**
 * Uploads a file using a signed URL approach
 * @param file The file to upload
 * @param bucket The storage bucket name
 * @param prefix The prefix/folder path where the file should be stored
 * @param dispatch The Redux dispatch function
 * @returns The public URL of the uploaded file
 */
export const uploadFileWithSignedUrl = async (
  file: File,
  bucket: string,
  prefix: string,
  dispatch: AppDispatch
): Promise<{ url?: string; error?: string }> => {
  try {
    // Generate a unique filename
    const timestamp = new Date().getTime();
    const randomString = Math.random().toString(36).substring(2, 10);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;

    // Full path in the bucket
    const fullPath = `${prefix}/${fileName}`;

    // Get a signed URL for upload
    const signedUrlResponse = await dispatch(
      getSignedUploadUrl({ bucket, path: fullPath })
    ).unwrap();

    if (!signedUrlResponse.signedUrl) {
      throw new Error("Failed to get signed upload URL");
    }

    // Upload the file using the signed URL
    const uploadResponse = await dispatch(
      uploadToSignedUrl({
        signedUrl: signedUrlResponse.signedUrl,
        file,
        token: signedUrlResponse.token,
      })
    ).unwrap();

    // Return the public URL to the uploaded file
    // The URL format depends on whether the bucket is public or not
    const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${uploadResponse.Key}`;

    return {
      url: publicUrl,
    };
  } catch (error) {
    console.error("Error in uploadFileWithSignedUrl:", error);
    return {
      error: error instanceof Error ? error.message : "Unknown upload error",
    };
  }
};
