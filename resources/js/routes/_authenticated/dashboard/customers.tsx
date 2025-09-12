import { createFileRoute } from '@tanstack/react-router'
import { DashboardCustomers } from '@/features/dashboard/components/dashboard-customers'

export const Route = createFileRoute('/_authenticated/dashboard/customers')({
  component: DashboardCustomers,
})