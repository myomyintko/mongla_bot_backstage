import { createFileRoute } from '@tanstack/react-router'
import { DashboardOverview } from '@/features/dashboard/components/dashboard-overview'

export const Route = createFileRoute('/_authenticated/dashboard/overview')({
  component: DashboardOverview,
})