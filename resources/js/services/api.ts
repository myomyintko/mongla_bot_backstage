import axios from 'axios'
import { toast } from 'sonner'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if user was suspended
      if (error.response?.data?.suspended) {
        // Clear all auth data
        localStorage.removeItem('access_token')
        // Show suspended message and redirect
        toast.error('Your account has been suspended. You have been logged out.')
      } else {
        // Regular 401 - just clear token and redirect
        localStorage.removeItem('access_token')
      }
    }
    return Promise.reject(error)
  }
)

export default api
