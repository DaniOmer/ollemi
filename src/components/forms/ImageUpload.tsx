"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { deleteFile } from "@/lib/supabase/client";
import { Loader2, Upload, X } from "lucide-react";
import { useAppDispatch } from "@/lib/redux/store";
import { uploadFileWithSignedUrl } from "@/utils/uploadUtils";

interface ImageUploadProps {
  bucket: string;
  path: string;
  onUploadComplete: (url: string) => void;
  onUploadError: (error: string) => void;
  currentImageUrl?: string;
  className?: string;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
}

/**
 * Image Upload Component
 *
 * This component handles image uploads to Supabase Storage.
 * It provides a UI for selecting, previewing, and uploading images.
 */
export function ImageUpload({
  bucket,
  path,
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  className = "",
  maxSizeMB = 5,
  acceptedFileTypes = "image/*",
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dispatch = useAppDispatch();

  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxSizeBytes) {
      onUploadError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Upload the file
    setIsUploading(true);
    try {
      // Upload using signed URL
      const { url, error } = await uploadFileWithSignedUrl(
        file,
        bucket,
        path,
        dispatch
      );

      if (error) {
        throw new Error(error);
      }

      if (url) {
        onUploadComplete(url);
      }
    } catch (error) {
      console.error("Upload error:", error);
      onUploadError(error instanceof Error ? error.message : "Upload failed");
      // Reset preview on error
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemoveImage = async () => {
    if (!preview || !currentImageUrl) {
      setPreview(null);
      return;
    }

    // Extract the path from the URL
    const urlObj = new URL(currentImageUrl);
    const pathFromUrl = urlObj.pathname.split("/").slice(2).join("/");

    if (pathFromUrl) {
      try {
        setIsUploading(true);
        const { error } = await deleteFile(bucket, pathFromUrl);

        if (error) {
          throw new Error(error);
        }

        setPreview(null);
        onUploadComplete(""); // Indicate the image was removed
      } catch (error) {
        console.error("Delete error:", error);
        onUploadError(error instanceof Error ? error.message : "Delete failed");
      } finally {
        setIsUploading(false);
      }
    } else {
      // Just clear the preview if we can't parse the path
      setPreview(null);
      onUploadComplete("");
    }
  };

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {preview ? (
        <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-primary/20">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-full object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-1 right-1 bg-destructive text-white rounded-full p-1 shadow-md hover:bg-destructive/80 transition-colors"
            disabled={isUploading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="w-32 h-32 rounded-full bg-muted flex items-center justify-center border-2 border-dashed border-primary/20">
          <Upload className="h-8 w-8 text-muted-foreground" />
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        disabled={isUploading}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="mt-2"
      >
        {isUploading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Uploading...
          </>
        ) : preview ? (
          "Change Image"
        ) : (
          "Upload Image"
        )}
      </Button>
    </div>
  );
}
