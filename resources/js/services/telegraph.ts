import api from './api'

interface TelegraphBot {
  id: number
  token: string
  name: string
  created_at: string
  updated_at: string
  chats: TelegraphChat[]
}

interface TelegraphChat {
  id: number
  chat_id: string
  name: string
  telegraph_bot_id: number
  created_at: string
  updated_at: string
}

interface ApiResponse<T> {
  success: boolean
  message?: string
  data?: T
}

interface WebhookInfo {
  url: string
  has_custom_certificate: boolean
  pending_update_count: number
  last_error_date: string | null
  last_error_message: string | null
  max_connections: number
  allowed_updates: string[]
}

interface WebhookDomain {
  domain: string | null
  webhook_url: string | null
}


class TelegraphService {

  // Bot management (single bot configuration)
  async getBot(): Promise<ApiResponse<TelegraphBot>> {
    const response = await api.get<ApiResponse<TelegraphBot>>('/telegraph/bot')
    return response.data
  }

  // Webhook management
  async registerWebhook(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/telegraph/bot/register-webhook')
    return response.data
  }

  async unregisterWebhook(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/telegraph/bot/unregister-webhook')
    return response.data
  }

  // Bot actions
  async sendTestMessage(): Promise<ApiResponse<void>> {
    const response = await api.post<ApiResponse<void>>('/telegraph/bot/send-test-message')
    return response.data
  }

  async getBotInfo(): Promise<ApiResponse<any>> {
    const response = await api.get<ApiResponse<any>>('/telegraph/bot/info')
    return response.data
  }

  // Webhook domain management (read-only from .env)

  async getWebhookDomain(): Promise<ApiResponse<WebhookDomain>> {
    const response = await api.get<ApiResponse<WebhookDomain>>('/telegraph/bot/webhook-domain')
    return response.data
  }

  async getWebhookInfo(): Promise<ApiResponse<WebhookInfo>> {
    const response = await api.get<ApiResponse<WebhookInfo>>('/telegraph/bot/webhook-info')
    return response.data
  }
}

export const telegraphService = new TelegraphService()
export type { TelegraphBot, TelegraphChat, ApiResponse, WebhookInfo, WebhookDomain }
