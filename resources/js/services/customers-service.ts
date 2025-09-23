import { api } from './api'

export interface Customer {
  id: string
  name: string
  username?: string
  status: string
  join_date: string
  join_date_formatted: string
  created_at: string
  raw_name?: string
}

export interface CustomerStats {
  total_customers: number
  new_customers_today: number
  growth_rate: number
  avg_order_value: number
}

export interface CustomerListResponse {
  data: Customer[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface CustomerRecentResponse {
  data: Customer[]
  total: number
}

export class CustomersService {
  static async getStats(): Promise<CustomerStats> {
    const response = await api.get('/customers/stats')
    return response.data
  }

  static async getRecent(limit: number = 5): Promise<CustomerRecentResponse> {
    const response = await api.get(`/customers/recent?limit=${limit}`)
    return response.data
  }

  static async getAll(
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<CustomerListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    })

    if (search) {
      params.append('search', search)
    }

    const response = await api.get(`/customers?${params.toString()}`)
    return response.data
  }
}

export default CustomersService