"use client";

import { useState, useRef, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";

import { CheckCircle, Trash2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Photo } from "@/types";
import { v4 as uuidv4 } from "uuid";
import { useTranslations } from "@/hooks/useTranslations";

interface PhotoUploadProps {
  companyId: string;
  existingPhotos?: Photo[];
  tempPhotos?: Photo[];
  onPhotoRemove?: (photoId: string) => void;
  onAddTempPhoto?: (photo: Photo) => void;
  onRemoveTempPhoto?: (photoId: string) => void;
  className?: string;
  maxSizeMB?: number;
  acceptedFileTypes?: string;
}

/**
 * Photo Upload Component
 *
 * This component handles photo uploads for company profiles.
 * It provides a UI for selecting, previewing, and managing photos.
 */
export function PhotoUpload({
  companyId,
  existingPhotos = [],
  tempPhotos = [],
  onPhotoRemove,
  onAddTempPhoto,
  onRemoveTempPhoto,
  className = "",
  maxSizeMB = 5,
  acceptedFileTypes = "image/*",
}: PhotoUploadProps) {
  const { t } = useTranslations();

  // Store files separately
  const [tempPhotoFiles, setTempPhotoFiles] = useState<Record<string, File>>(
    {}
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024; // Convert MB to bytes

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset error state
    setUploadError(null);

    // Validate file size
    if (file.size > maxSizeBytes) {
      setUploadError(`File size exceeds ${maxSizeMB}MB limit`);
      return;
    }

    // Create a temporary preview
    const objectUrl = URL.createObjectURL(file);
    const photoId = uuidv4();

    // Store file in component state
    setTempPhotoFiles((prev) => ({
      ...prev,
      [photoId]: file,
    }));

    // Add to temporary photos via callback
    const tempPhoto: Photo = {
      id: photoId,
      company_id: companyId,
      url: objectUrl,
      featured: false,
      isTemp: true, // Flag to identify temporary photos
      file: file, // Attach the file object to the photo
    };

    if (onAddTempPhoto) {
      onAddTempPhoto(tempPhoto);
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveTempPhoto = (photoId: string) => {
    // Clean up the file from state
    setTempPhotoFiles((prev) => {
      const newState = { ...prev };
      delete newState[photoId];
      return newState;
    });

    if (onRemoveTempPhoto) {
      onRemoveTempPhoto(photoId);
    }
  };

  const handleRemoveExistingPhoto = (photoId: string) => {
    if (onPhotoRemove) {
      onPhotoRemove(photoId);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Error message */}
      {uploadError && (
        <div className="text-destructive text-sm mb-2">{uploadError}</div>
      )}

      {/* Photo grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Existing photos */}
        {existingPhotos.map((photo) => (
          <div key={photo.id} className="relative group aspect-square">
            <Image
              src={photo.url}
              alt={photo.alt || "Company photo"}
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              {photo.featured && (
                <div className="absolute top-2 left-2 text-primary-foreground">
                  <CheckCircle className="h-5 w-5" />
                </div>
              )}
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveExistingPhoto(photo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Temporary photos */}
        {tempPhotos.map((photo: Photo) => (
          <div key={photo.id} className="relative group aspect-square">
            <Image
              src={photo.url}
              alt={photo.alt || "Temporary photo"}
              fill
              className="rounded-lg object-cover"
            />
            <div className="absolute top-0 right-0 m-2">
              <div className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                {t("settings.temporary")}
              </div>
            </div>
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
              <Button
                variant="destructive"
                size="icon"
                onClick={() => handleRemoveTempPhoto(photo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {/* Upload button */}
        <div
          className="aspect-square border-2 border-dashed border-muted-foreground/25 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <ImageIcon className="h-8 w-8 mb-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {t("settings.addPhoto")}
          </span>
        </div>
      </div>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={acceptedFileTypes}
        className="hidden"
        disabled={isUploading}
      />
    </div>
  );
}
