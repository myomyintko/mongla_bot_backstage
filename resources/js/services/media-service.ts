import { api } from './api';

export interface MediaFile {
  original_name: string;
  filename: string;
  path: string;
  url: string;
  size: number;
  mime_type: string;
  type: 'image' | 'video';
}

export interface MediaUploadResponse {
  success: boolean;
  message: string;
  data: MediaFile[];
  errors?: Record<string, string[]>;
}

export interface MediaDeleteResponse {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
}

export interface MediaInfoResponse {
  success: boolean;
  data: {
    path: string;
    url: string;
    size: number;
    mime_type: string;
    last_modified: number;
  };
  message?: string;
}

export const mediaService = {
  /**
   * Upload multiple media files
   */
  async uploadFiles(files: File[], path?: string): Promise<MediaUploadResponse> {
    const formData = new FormData();
    
    files.forEach((file) => {
      formData.append('files[]', file);
    });

    // Add path parameter if provided
    if (path) {
      formData.append('path', path);
    }

    const response = await api.post('/media/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  /**
   * Delete a media file
   */
  async deleteFile(path: string): Promise<MediaDeleteResponse> {
    const response = await api.delete('/media/delete', {
      data: { path },
    });

    return response.data;
  },

  /**
   * Get media file information
   */
  async getFileInfo(path: string): Promise<MediaInfoResponse> {
    const response = await api.get('/media/info', {
      params: { path },
    });

    return response.data;
  },

  /**
   * Get full URL for a media file
   */
  getMediaUrl(path: string): string {
    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path;
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
    return `${baseUrl}/storage/${path}`;
  },

  /**
   * Extract file path from URL
   */
  extractPathFromUrl(url: string): string {
    // Remove the storage prefix to get the relative path
    const storagePrefix = '/storage/';
    if (url.includes(storagePrefix)) {
      return url.split(storagePrefix)[1];
    }
    return url;
  },
};
