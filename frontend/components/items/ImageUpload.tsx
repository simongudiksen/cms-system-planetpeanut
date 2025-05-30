import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { cn } from "@/utils/cn";
import { Button } from "@/components/ui/Button";

interface ImageUploadProps {
  value?: string[];
  onChange: (files: File[]) => void;
  onRemove?: (index: number) => void;
  maxFiles?: number;
  maxSize?: number; // in bytes
  accept?: Record<string, string[]>;
  disabled?: boolean;
  error?: string;
  label?: string;
  description?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value = [],
  onChange,
  onRemove,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    "image/*": [".png", ".jpg", ".jpeg", ".webp"],
  },
  disabled = false,
  error,
  label = "Upload Images",
  description = "Drag & drop images here, or click to select files",
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (disabled) return;

      const validFiles = acceptedFiles.filter((file) => {
        if (file.size > maxSize) {
          console.warn(
            `File ${file.name} is too large. Maximum size is ${formatFileSize(
              maxSize
            )}`
          );
          return false;
        }
        return true;
      });

      if (uploadedFiles.length + validFiles.length > maxFiles) {
        console.warn(`Maximum ${maxFiles} files allowed`);
        validFiles.splice(maxFiles - uploadedFiles.length);
      }

      const newFiles = [...uploadedFiles, ...validFiles];
      const newPreviewUrls = [...previewUrls];

      validFiles.forEach((file) => {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push(url);
      });

      setUploadedFiles(newFiles);
      setPreviewUrls(newPreviewUrls);
      onChange(newFiles);
    },
    [uploadedFiles, previewUrls, onChange, maxFiles, maxSize, disabled]
  );

  const removeFile = useCallback(
    (index: number) => {
      if (disabled) return;

      const newFiles = [...uploadedFiles];
      const newPreviewUrls = [...previewUrls];

      // Revoke the object URL to prevent memory leaks
      if (previewUrls[index]) {
        URL.revokeObjectURL(previewUrls[index]);
      }

      newFiles.splice(index, 1);
      newPreviewUrls.splice(index, 1);

      setUploadedFiles(newFiles);
      setPreviewUrls(newPreviewUrls);
      onChange(newFiles);
      onRemove?.(index);
    },
    [uploadedFiles, previewUrls, onChange, onRemove, disabled]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } =
    useDropzone({
      onDrop,
      accept,
      maxFiles,
      maxSize,
      disabled,
      multiple: maxFiles > 1,
    });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="space-y-4">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      {/* Upload Area */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors",
          {
            "border-primary-300 bg-primary-50": isDragActive && !isDragReject,
            "border-error-300 bg-error-50": isDragReject || error,
            "border-gray-300 hover:border-gray-400":
              !isDragActive && !isDragReject && !error,
            "opacity-50 cursor-not-allowed": disabled,
          }
        )}
      >
        <input {...getInputProps()} />

        <div className="space-y-2">
          <svg
            className={cn("mx-auto h-12 w-12", {
              "text-primary-400": isDragActive && !isDragReject,
              "text-error-400": isDragReject || error,
              "text-gray-400": !isDragActive && !isDragReject && !error,
            })}
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          <div className="text-sm">
            {isDragActive ? (
              <p className="text-primary-600">Drop the files here...</p>
            ) : (
              <div>
                <p className="text-gray-600">{description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Maximum {maxFiles} files, up to {formatFileSize(maxSize)} each
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && <p className="text-sm text-error-600">{error}</p>}

      {/* File Previews */}
      {previewUrls.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {previewUrls.map((url, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Remove Button */}
              <Button
                variant="danger"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
                disabled={disabled}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Button>

              {/* File Info */}
              <div className="mt-2 text-xs text-gray-500">
                <p className="truncate">{uploadedFiles[index]?.name}</p>
                <p>{formatFileSize(uploadedFiles[index]?.size || 0)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Existing Images from Server */}
      {value.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={imageUrl}
                    alt={`Current image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {onRemove && (
                  <Button
                    variant="danger"
                    size="sm"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(index)}
                    disabled={disabled}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export { ImageUpload };
