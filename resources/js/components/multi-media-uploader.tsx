"use client";

import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Upload, Trash, Eye, Download, FileText, Play } from "lucide-react";
import { mediaService, MediaFile } from "@/services/media-service";

interface UploadFile {
  uid: string;
  name: string;
  status: 'uploading' | 'done' | 'error' | 'removed';
  url?: string;
  thumbUrl?: string;
  percent?: number;
  response?: any;
  error?: any;
}

interface MultiMediaUploaderProps {
  value: string[];
  onChange: (files: string[]) => void;
  maxFiles?: number;
  className?: string;
  name?: string;
  accept?: string;
  listType?: 'text' | 'picture' | 'picture-card';
  showUploadList?: boolean;
  onPreview?: (file: UploadFile) => void;
  onDownload?: (file: UploadFile) => void;
  showDownloadButton?: boolean;
  uploadPath?: string; // Path for organizing uploaded files
  onFilesDeleted?: (deletedFiles: string[]) => void; // Callback for files that were removed from UI
  onFilesUploaded?: (uploadedFiles: string[]) => void; // Callback for files that were uploaded
}

export function MultiMediaUploader({
  value = [],
  onChange,
  maxFiles,
  className,
  name,
  accept = "image/*,video/*",
  listType = 'picture-card',
  showUploadList = true,
  onPreview,
  onDownload,
  showDownloadButton = true,
  uploadPath,
  onFilesDeleted,
  onFilesUploaded,
}: MultiMediaUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);
  const [uploadingFiles, setUploadingFiles] = useState<UploadFile[]>([]);

  const generateUid = () => {
    return `rc-upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFileSelect = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return;

      const fileArray = Array.from(files);
      const validFiles = fileArray.filter((file) => {
        const isValidType = accept.split(",").some((type) => {
          if (type.trim() === "image/*") {
            return file.type.startsWith("image/");
          }
          if (type.trim() === "video/*") {
            return file.type.startsWith("video/");
          }
          if (type.trim() === "image/*,video/*") {
            return file.type.startsWith("image/") || file.type.startsWith("video/");
          }
          return file.type === type.trim();
        });
        return isValidType;
      });

      if (validFiles.length === 0) {
        alert("Please select valid image or video files.");
        return;
      }

      if (maxFiles && value.length + validFiles.length > maxFiles) {
        alert(`Maximum ${maxFiles} files allowed.`);
        return;
      }

      setIsUploading(true);

      try {
        const newUploadingFiles: UploadFile[] = validFiles.map((file) => ({
          uid: generateUid(),
          name: file.name,
          status: 'uploading' as const,
          percent: 0,
        }));

        setUploadingFiles(newUploadingFiles);

        // Upload files to the server
        const response = await mediaService.uploadFiles(validFiles, uploadPath);
        
        if (response.success) {
          // Update progress to 100% for all files
          setUploadingFiles(prev => 
            prev.map(f => ({ ...f, percent: 100, status: 'done' as const }))
          );

          // Convert uploaded files to URLs with type information
          const uploadedUrls = response.data.map((file: MediaFile) => {
            const urlWithType = `${file.url}#type=${file.type}`;
            return urlWithType;
          });

          // Notify parent component about uploaded files
          if (onFilesUploaded) {
            onFilesUploaded(uploadedUrls);
          }

          // Add all uploaded URLs to the value array
          onChange([...value, ...uploadedUrls]);
          setUploadingFiles([]);
        } else {
          throw new Error(response.message || 'Upload failed');
        }
      } catch (error: any) {
        console.error("Upload failed:", error);
        setUploadingFiles(prev => 
          prev.map(f => ({ ...f, status: 'error' as const, error: error.message }))
        );
        alert(`Upload failed: ${error.message || 'Please try again.'}`);
      } finally {
        setIsUploading(false);
      }
    },
    [value, onChange, maxFiles, accept]
  );

  const handleDelete = useCallback(
    async (index: number) => {
      setDeletingIndex(index);
      
      // Simulate deletion delay for animation
      setTimeout(() => {
        const fileToDelete = value[index];
        const newImages = value.filter((_, i) => i !== index);
        
        // Notify parent component about the deleted file
        if (onFilesDeleted && fileToDelete) {
          onFilesDeleted([fileToDelete]);
        }
        
        onChange(newImages);
        setDeletingIndex(null);
      }, 500);
    },
    [value, onChange, onFilesDeleted]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFileSelect(e.dataTransfer.files);
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const isImage = useCallback(
    (url: string) => {
      // Check if URL has stored type information
      if (url.includes('#type=')) {
        return url.includes('#type=image');
      }
      // Object URLs (blob:) - assume image if no type info
      if (url.startsWith('blob:')) {
        return true;
      }
      // Check with regex for other URLs
      return /\.(jpeg|jpg|png|gif|webp|avif)$/i.test(url);
    },
    []
  );

  const isVideo = useCallback(
    (url: string) => {
      // Check if URL has stored type information
      if (url.includes('#type=')) {
        return url.includes('#type=video');
      }
      // Check with regex for video URLs
      return /\.(mp4|mov|avi|mkv|webm)$/i.test(url);
    },
    []
  );

  const renderUploadButton = () => {
    const totalFiles = value.length + uploadingFiles.length;
    if (maxFiles && totalFiles >= maxFiles) return null;
    
    if (listType === 'picture-card') {
      return (
        <div
          className={cn(
            "border-2 border-dashed border-muted-foreground/25 rounded-lg transition-colors",
            "hover:border-muted-foreground/50 hover:bg-muted/50",
            "focus-within:border-primary focus-within:bg-primary/5",
            "cursor-pointer w-28 h-28 flex flex-col items-center justify-center flex-shrink-0"
          )}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            type="file"
            multiple
            accept={accept}
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
            id={`file-input-${name || "images"}`}
            disabled={isUploading}
          />
          <label
            htmlFor={`file-input-${name || "images"}`}
            className="cursor-pointer block w-full h-full flex flex-col items-center justify-center"
          >
            <Upload className="h-6 w-6 text-muted-foreground mb-1" />
            <div className="text-xs text-muted-foreground text-center px-1">
              {maxFiles ? `${totalFiles}/${maxFiles}` : 'Upload'}
            </div>
          </label>
        </div>
      );
    }
    
    return (
      <div
        className={cn(
          "border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center transition-colors",
          "hover:border-muted-foreground/50 hover:bg-muted/50",
          "focus-within:border-primary focus-within:bg-primary/5",
          "cursor-pointer"
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
          id={`file-input-${name || "images"}`}
          disabled={isUploading}
        />
        <label
          htmlFor={`file-input-${name || "images"}`}
          className="cursor-pointer block"
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-primary">Click to upload</span> or drag and drop
            </div>
            <div className="text-xs text-muted-foreground">
              {accept === "image/*" ? "Images" : accept}
            </div>
            {maxFiles && (
              <div className="text-xs text-muted-foreground">
                {totalFiles}/{maxFiles} files
              </div>
            )}
          </div>
        </label>
      </div>
    );
  };

  const renderFileItem = (url: string, index: number) => {
    // Extract clean URL without type information
    const cleanUrl = url.split('#')[0];
    const isImageFile = isImage(url);
    const isVideoFile = isVideo(url);
    const fileName = cleanUrl.split('/').pop() || `file-${index + 1}`;
    
    if (listType === 'picture-card') {
      return (
        <div
          key={index}
          className={cn(
            "relative group rounded-lg overflow-hidden border border-border bg-card",
            "transition-all duration-300 w-28 h-28 flex-shrink-0",
            deletingIndex === index && "animate-glow-effect"
          )}
        >
          {isImageFile ? (
            <img
              src={cleanUrl}
              alt={fileName}
              className="w-full h-full object-cover"
              onError={(e) => {
                console.error('Image failed to load:', cleanUrl);
                // Fallback to file icon if image fails to load
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
           ) : isVideoFile ? (
             <div className="relative w-full h-full">
               <video
                 src={cleanUrl}
                 className="w-full h-full object-cover"
                 muted
                 onError={(e) => {
                   console.error('Video failed to load:', cleanUrl);
                   // Fallback to file icon if video fails to load
                   e.currentTarget.style.display = 'none';
                   const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                   if (fallback) fallback.style.display = 'flex';
                 }}
               />
             </div>
           ) : null}
          <div 
            className="w-full h-full bg-muted flex items-center justify-center"
            style={{ display: (isImageFile || isVideoFile) ? 'none' : 'flex' }}
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          
           {/* Actions Overlay */}
           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center space-x-1">
             {onPreview && (
               <Button
                 type="button"
                 variant="ghost"
                 size="sm"
                 className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20"
                 onClick={() => onPreview({ uid: String(index), name: fileName, status: 'done', url: cleanUrl })}
               >
                 {isVideoFile ? (
                   <Play className="h-4 w-4 fill-current" />
                 ) : (
                   <Eye className="h-4 w-4" />
                 )}
               </Button>
             )}
            {onDownload && showDownloadButton && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20"
                onClick={() => onDownload({ uid: String(index), name: fileName, status: 'done', url: cleanUrl })}
              >
                <Download className="h-4 w-4" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-white hover:text-white hover:bg-white/20"
              onClick={() => handleDelete(index)}
              disabled={isUploading}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Loading Overlay */}
          {deletingIndex === index && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
              <div className="text-xs text-muted-foreground">Deleting...</div>
            </div>
          )}
        </div>
      );
    }

    // Text list style
    return (
      <div
        key={index}
        className={cn(
          "flex items-center justify-between p-3 border border-border rounded-lg bg-card",
          "transition-all duration-300",
          deletingIndex === index && "animate-glow-effect"
        )}
      >
        <div className="flex items-center space-x-3">
          {isImageFile ? (
            <img
              src={cleanUrl}
              alt={fileName}
              className="w-8 h-8 object-cover rounded"
              onError={(e) => {
                console.error('Image failed to load:', cleanUrl);
                e.currentTarget.style.display = 'none';
                const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
           ) : isVideoFile ? (
             <div className="relative w-8 h-8">
               <video
                 src={cleanUrl}
                 className="w-8 h-8 object-cover rounded"
                 muted
                 onError={(e) => {
                   console.error('Video failed to load:', cleanUrl);
                   e.currentTarget.style.display = 'none';
                   const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                   if (fallback) fallback.style.display = 'flex';
                 }}
               />
               {/* Play icon overlay for videos */}
               <div className="absolute inset-0 flex items-center justify-center bg-black/20 rounded">
                 <Play className="h-3 w-3 text-white fill-current" />
               </div>
             </div>
           ) : null}
          <div 
            className="w-8 h-8 bg-muted flex items-center justify-center rounded"
            style={{ display: (isImageFile || isVideoFile) ? 'none' : 'flex' }}
          >
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <span className="text-sm font-medium truncate max-w-32">{fileName}</span>
        </div>
        
         <div className="flex items-center space-x-1">
           {onPreview && (
             <Button
               type="button"
               variant="ghost"
               size="sm"
               className="h-8 w-8 p-0"
               onClick={() => onPreview({ uid: String(index), name: fileName, status: 'done', url: cleanUrl })}
             >
               {isVideoFile ? (
                 <Play className="h-4 w-4 fill-current" />
               ) : (
                 <Eye className="h-4 w-4" />
               )}
             </Button>
           )}
          {onDownload && showDownloadButton && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => onDownload({ uid: String(index), name: fileName, status: 'done', url: cleanUrl })}
            >
              <Download className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
            onClick={() => handleDelete(index)}
            disabled={isUploading}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  };

  const renderUploadingFiles = () => {
    return uploadingFiles.map((file, index) => (
      <div
        key={file.uid}
        className={cn(
          "relative group rounded-lg overflow-hidden border-2 border-dashed border-primary/50 bg-primary/5",
          "w-28 h-28 flex-shrink-0"
        )}
      >
        <div className="w-full h-full flex flex-col items-center justify-center p-1">
          <Upload className="h-5 w-5 text-primary mb-1" />
          <div className="text-xs text-primary text-center font-medium leading-tight">
            {file.name.length > 6 ? `${file.name.substring(0, 6)}...` : file.name}
          </div>
          <div className="text-xs text-primary/70 mt-1">
            {file.percent}%
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-muted/50">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${file.percent}%` }}
          />
        </div>
        
        {/* Status Overlay */}
        {file.status === 'error' && (
          <div className="absolute inset-0 bg-destructive/20 flex items-center justify-center">
            <Trash className="h-6 w-6 text-destructive" />
          </div>
        )}
        
        {/* Uploading Indicator */}
        <div className="absolute top-1 right-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
        </div>
        
        {/* File Index Badge */}
        <div className="absolute top-1 left-1">
          <div className="w-4 h-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
            {index + 1}
          </div>
        </div>
      </div>
    ));
  };

  if (!showUploadList) {
    return (
      <div className={cn("space-y-4", className)}>
        {renderUploadButton()}
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* File List with Upload Button */}
      <div className="w-full max-h-96 overflow-y-auto overflow-x-hidden">
        <div className="flex flex-wrap gap-3">
          {value.filter(url => url && url.trim()).map((url, index) => renderFileItem(url, index))}
          {renderUploadingFiles()}
          {renderUploadButton()}
        </div>
      </div>
    </div>
  );
}
