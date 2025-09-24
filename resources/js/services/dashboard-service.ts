import { api } from './api'

export interface DashboardOverview {
  total_revenue: number
  subscriptions: number
  sales: number
  active_now: number
}

export interface MonthlyRevenueData {
  name: string
  total: number
}

export interface RecentSale {
  name: string
  email: string
  amount: string
}

export class DashboardService {
  static async getOverview(): Promise<DashboardOverview> {
    const response = await api.get('/dashboard/overview')
    return response.data
  }

  static async getMonthlyRevenue(): Promise<MonthlyRevenueData[]> {
    const response = await api.get('/dashboard/monthly-revenue')
    return response.data
  }

  static async getRecentSales(): Promise<{ data: RecentSale[] }> {
    const response = await api.get('/dashboard/recent-sales')
    return response.data
  }
}

export default DashboardService