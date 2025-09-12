import { api } from './api'

export interface TwoFactorStatus {
  is_enabled: boolean
  enabled_at: string | null
  has_recovery_codes: boolean
}

export interface TwoFactorSetup {
  secret_key: string
  qr_code_url: string
  manual_entry_key: string
}

export interface TwoFactorResponse {
  success: boolean
  message: string
  data?: any
  errors?: Record<string, string[]>
}

export const twoFactorService = {
  // Get 2FA status
  getStatus: async (): Promise<TwoFactorStatus> => {
    const response = await api.get('/two-factor/status')
    return response.data.data
  },

  // Generate 2FA secret
  generateSecret: async (): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/generate-secret')
    return response.data
  },

  // Enable 2FA
  enable: async (code: string): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/enable', { code })
    return response.data
  },

  // Disable 2FA
  disable: async (code: string): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/disable', { code })
    return response.data
  },

  // Verify 2FA code
  verify: async (code: string): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/verify', { code })
    return response.data
  },

  // Verify recovery code
  verifyRecoveryCode: async (recoveryCode: string): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/verify-recovery-code', { 
      recovery_code: recoveryCode 
    })
    return response.data
  },

  // Regenerate recovery codes
  regenerateRecoveryCodes: async (): Promise<TwoFactorResponse> => {
    const response = await api.post('/two-factor/regenerate-recovery-codes')
    return response.data
  },
}
