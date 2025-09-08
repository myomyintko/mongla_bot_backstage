import api from './api'
import { type MenuButton } from '@/features/menu-buttons/data/schema'

export interface MenuButtonFilters {
  status?: number
  parent_id?: number | 'null' | 'not_null'
  button_type?: string
  search?: string
  per_page?: number
  page?: number
}

export interface MenuButtonCreateData {
  parent_id?: number | null
  name: string
  button_type?: string
  sort?: number
  status?: number
  media_url?: string | null
  enable_template?: boolean
  template_content?: string
  sub_btns?: string[]
}

export interface MenuButtonUpdateData extends Partial<MenuButtonCreateData> {}

export interface BulkUpdateData {
  ids: number[]
  updates: Partial<MenuButtonUpdateData>
}

export interface BulkDeleteData {
  ids: number[]
}

export const menuButtonsService = {
  async getMenuButtons(filters: MenuButtonFilters = {}): Promise<{
    data: MenuButton[]
    current_page: number
    last_page: number
    per_page: number
    total: number
  }> {
    const response = await api.get('/menu-buttons', { params: filters })
    return response.data
  },

  async getMenuButton(id: number): Promise<MenuButton> {
    const response = await api.get(`/menu-buttons/${id}`)
    return response.data
  },

  async createMenuButton(data: MenuButtonCreateData): Promise<MenuButton> {
    const response = await api.post('/menu-buttons', data)
    return response.data
  },

  async updateMenuButton(id: number, data: MenuButtonUpdateData): Promise<MenuButton> {
    const response = await api.put(`/menu-buttons/${id}`, data)
    return response.data
  },

  async deleteMenuButton(id: number): Promise<void> {
    await api.delete(`/menu-buttons/${id}`)
  },

  async getMenuButtonHierarchy(): Promise<MenuButton[]> {
    const response = await api.get('/menu-buttons-hierarchy')
    return response.data
  },

  async bulkUpdate(data: BulkUpdateData): Promise<{ message: string }> {
    const response = await api.post('/menu-buttons/bulk-update', data)
    return response.data
  },

  async bulkDelete(data: BulkDeleteData): Promise<{ message: string }> {
    const response = await api.post('/menu-buttons/bulk-delete', data)
    return response.data
  },
}