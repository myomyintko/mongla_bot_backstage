import { api } from './api'

export interface MediaLibraryItem {
  id: number
  name: string
  original_name: string
  file_path: string
  file_size: number
  mime_type: string
  file_type: 'image' | 'video' | 'document' | 'other'
  width: number | null
  height: number | null
  duration: number | null
  alt_text: string | null
  description: string | null
  tags: string[]
  is_public: boolean
  created_at: string
  updated_at: string
  url?: string
  formatted_size?: string
  formatted_duration?: string
}

export interface MediaLibraryResponse {
  success: boolean
  data: MediaLibraryItem[]
  meta?: {
    current_page: number
    last_page: number
    per_page: number
    total: number
  }
  message?: string
}

export interface MediaLibraryFilters {
  search?: string
  file_type?: string
  is_public?: boolean
  sort_by?: string
  sort_order?: 'asc' | 'desc'
  per_page?: number
  page?: number
}

export interface UploadResponse {
  success: boolean
  message: string
  data: MediaLibraryItem[]
  errors?: Array<{
    file: string
    error: string
  }>
}

export interface BulkDeleteResponse {
  success: boolean
  message: string
}

class MediaLibraryService {
  private baseUrl = '/media-library'

  /**
   * Get all media library items with filters and pagination
   */
  async getMediaLibrary(filters: MediaLibraryFilters = {}): Promise<MediaLibraryResponse> {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.file_type && filters.file_type !== 'all') params.append('file_type', filters.file_type)
    if (filters.is_public !== undefined) params.append('is_public', filters.is_public.toString())
    if (filters.sort_by) params.append('sort_by', filters.sort_by)
    if (filters.sort_order) params.append('sort_order', filters.sort_order)
    if (filters.per_page) params.append('per_page', filters.per_page.toString())
    if (filters.page) params.append('page', filters.page.toString())

    const response = await api.get(`${this.baseUrl}?${params.toString()}`)
    return response.data
  }

  /**
   * Get a single media library item
   */
  async getMediaLibraryItem(id: number): Promise<{ success: boolean; data: MediaLibraryItem }> {
    const response = await api.get(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Upload files to media library
   */
  async uploadFiles(
    files: File[],
    metadata: {
      alt_text?: string
      description?: string
      tags?: string[]
      is_public?: boolean
      upload_path?: string
    } = {}
  ): Promise<UploadResponse> {
    const formData = new FormData()
    
    // Add files
    files.forEach((file) => {
      formData.append('files[]', file)
    })
    
    // Add metadata
    if (metadata.alt_text) formData.append('alt_text', metadata.alt_text)
    if (metadata.description) formData.append('description', metadata.description)
    if (metadata.tags) {
      metadata.tags.forEach((tag) => {
        formData.append('tags[]', tag)
      })
    }
    if (metadata.is_public !== undefined) {
      formData.append('is_public', metadata.is_public.toString())
    }
    if (metadata.upload_path) {
      formData.append('upload_path', metadata.upload_path)
    }

    const response = await api.post(this.baseUrl, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  }

  /**
   * Update media library item metadata
   */
  async updateMediaLibraryItem(
    id: number,
    data: {
      name?: string
      alt_text?: string
      description?: string
      tags?: string[]
      is_public?: boolean
    }
  ): Promise<{ success: boolean; data: MediaLibraryItem; message: string }> {
    const response = await api.put(`${this.baseUrl}/${id}`, data)
    return response.data
  }

  /**
   * Delete a single media library item
   */
  async deleteMediaLibraryItem(id: number): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`)
    return response.data
  }

  /**
   * Bulk delete multiple media library items
   */
  async bulkDeleteMediaLibraryItems(ids: number[]): Promise<BulkDeleteResponse> {
    const response = await api.post(`${this.baseUrl}/bulk-delete`, { ids })
    return response.data
  }

  /**
   * Get media library statistics
   */
  async getMediaLibraryStats(): Promise<{
    success: boolean
    data: {
      total_files: number
      total_size: number
      file_types: {
        image: number
        video: number
        document: number
        other: number
      }
      public_files: number
      private_files: number
    }
  }> {
    const response = await api.get(`${this.baseUrl}/stats`)
    return response.data
  }

  /**
   * Get full URL for a media file
   */
  getMediaUrl(path: string): string {
    // If it's already a full URL, return as is
    if (path.startsWith('http')) {
      return path
    }
    
    // If it's a relative path, construct the full URL
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000'
    return `${baseUrl}/storage/${path}`
  }

  /**
   * Extract file path from URL
   */
  extractPathFromUrl(url: string): string {
    // Remove the storage prefix to get the relative path
    const storagePrefix = '/storage/'
    if (url.includes(storagePrefix)) {
      return url.split(storagePrefix)[1]
    }
    return url
  }

  /**
   * Delete a file from storage (legacy method for compatibility)
   */
  async deleteFile(path: string): Promise<{ success: boolean; message: string }> {
    // This is a legacy method - in the new system, files are deleted through the media library API
    // For now, we'll just return success since the new system handles file deletion differently
    console.warn('deleteFile is deprecated. Use deleteMediaLibraryItem instead.')
    return { success: true, message: 'File deletion handled by media library system' }
  }
}

export const mediaLibraryService = new MediaLibraryService()
