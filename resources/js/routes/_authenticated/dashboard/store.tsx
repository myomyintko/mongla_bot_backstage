import { createFileRoute } from '@tanstack/react-router'
import { DashboardStore } from '@/features/dashboard/components/dashboard-store'

export const Route = createFileRoute('/_authenticated/dashboard/store')({
  component: DashboardStore,
})