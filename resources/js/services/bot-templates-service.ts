import api from './api'
import { type BotTemplate } from '@/features/bot-templates/data/schema'

export interface BotTemplateFilters {
  type?: string
  is_active?: boolean
  search?: string
  per_page?: number
  page?: number
}

export interface BotTemplateCreateData {
  name: string
  type: string
  content: string
  is_active?: boolean
  variables?: string[]
  description?: string
}

export interface BotTemplateUpdateData extends Partial<BotTemplateCreateData> {}

export interface BotTemplatePreviewData {
  type: string
  content: string
  variables?: Record<string, string>
}

export const botTemplatesService = {
  // Get all bot templates with filters
  getBotTemplates: async (filters: BotTemplateFilters = {}): Promise<{
    data: {
      templates: BotTemplate[]
      types: Record<string, string>
    }
    current_page: number
    last_page: number
    per_page: number
    total: number
  }> => {
    const params = new URLSearchParams()
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value))
      }
    })

    const response = await api.get(`/bot-templates?${params.toString()}`)
    return response.data
  },

  // Get a single bot template
  getBotTemplate: async (id: number) => {
    const response = await api.get(`/bot-templates/${id}`)
    return response.data
  },

  // Create a new bot template
  createBotTemplate: async (data: BotTemplateCreateData) => {
    const response = await api.post('/bot-templates', data)
    return response.data
  },

  // Update a bot template
  updateBotTemplate: async (id: number, data: BotTemplateUpdateData) => {
    const response = await api.put(`/bot-templates/${id}`, data)
    return response.data
  },

  // Delete a bot template
  deleteBotTemplate: async (id: number) => {
    const response = await api.delete(`/bot-templates/${id}`)
    return response.data
  },

  // Activate a bot template
  activateBotTemplate: async (id: number) => {
    const response = await api.post(`/bot-templates/${id}/activate`)
    return response.data
  },

  // Deactivate a bot template
  deactivateBotTemplate: async (id: number) => {
    const response = await api.post(`/bot-templates/${id}/deactivate`)
    return response.data
  },

  // Preview bot template with variables
  previewBotTemplate: async (data: BotTemplatePreviewData) => {
    const response = await api.post('/bot-templates/preview', data)
    return response.data
  },

  // Get available template types
  getTemplateTypes: async () => {
    const response = await api.get('/bot-templates')
    return response.data.types || {}
  },
}
