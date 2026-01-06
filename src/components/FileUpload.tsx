import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  accept?: string;
  uploadUrl?: string;
}

export default function FileUpload({
  onUploadComplete,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png",
  uploadUrl = "http://localhost:5454/api/upload",
}: FileUploadProps) {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleFileUpload = async (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const url =
            response.url ||
            response.fileUrl ||
            response.data?.url ||
            response.data?.fileUrl ||
            response.file?.url ||
            response.location ||
            response.path;
          if (url) {
            setUploadedUrl(url);
            setUploadSuccess(true);
            onUploadComplete(url);
            toast.success("File uploaded successfully!");
          } else {
            toast.error("Upload succeeded but no URL returned");
          }
          setIsUploading(false);
        } else {
          setIsUploading(false);
          toast.error("Failed to upload file");
        }
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Upload failed. Please try again.");
      };

      xhr.send(formData);
    } catch {
      setIsUploading(false);
      toast.error("Upload failed. Please try again.");
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const reset = () => {
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadedUrl("");
    setIsUploading(false);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-all ${
        isDragOver
          ? "border-green-500 bg-green-50"
          : uploadSuccess
          ? "border-green-500 bg-green-50"
          : "border-gray-300 hover:border-green-400"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      {uploadSuccess ? (
        <div className="space-y-2">
          <div className="flex items-center justify-center">
            <svg
              className="h-12 w-12 text-green-500 animate-bounce"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <p className="text-green-600 font-medium">Upload successful!</p>
          <p className="text-sm text-gray-500 truncate max-w-xs mx-auto">
            {uploadedUrl}
          </p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={reset}
            className="text-gray-500"
          >
            Upload different file
          </Button>
        </div>
      ) : isUploading ? (
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <svg
              className="h-10 w-10 text-green-500 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
          <p className="text-sm text-gray-600">
            Uploading... {uploadProgress}%
          </p>
        </div>
      ) : (
        <>
          <input
            type="file"
            id="fileUpload"
            className="hidden"
            onChange={handleFileInputChange}
            accept={accept}
          />
          <label
            htmlFor="fileUpload"
            className="cursor-pointer flex flex-col items-center"
          >
            <svg
              className="h-10 w-10 text-green-500 mb-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <Button
              type="button"
              variant="outline"
              className="bg-green-600 hover:bg-green-700 text-white border-0 mb-2"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload File
            </Button>
            <p className="text-sm text-gray-500">
              or drag and drop your file here
            </p>
          </label>
        </>
      )}
    </div>
  );
}

// Export a hook for more control over the upload state
export function useFileUpload(uploadUrl = "http://localhost:5454/api/upload") {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadSuccess(false);

    const formData = new FormData();
    formData.append("file", file);

    return new Promise((resolve) => {
      const token = localStorage.getItem("token");

      const xhr = new XMLHttpRequest();
      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          const response = JSON.parse(xhr.responseText);
          const url =
            response.url ||
            response.fileUrl ||
            response.data?.url ||
            response.data?.fileUrl ||
            response.file?.url ||
            response.location ||
            response.path;
          if (url) {
            setUploadedUrl(url);
            setUploadSuccess(true);
            toast.success("File uploaded successfully!");
            resolve(url);
          } else {
            toast.error("Upload succeeded but no URL returned");
            resolve(null);
          }
        } else {
          toast.error("Failed to upload file");
          resolve(null);
        }
        setIsUploading(false);
      };

      xhr.onerror = () => {
        setIsUploading(false);
        toast.error("Upload failed. Please try again.");
        resolve(null);
      };

      xhr.send(formData);
    });
  };

  const reset = () => {
    setUploadProgress(0);
    setUploadSuccess(false);
    setUploadedUrl("");
    setIsUploading(false);
  };

  return {
    uploadFile,
    uploadProgress,
    isUploading,
    uploadSuccess,
    uploadedUrl,
    reset,
  };
}
