import { createFileRoute } from '@tanstack/react-router'
import { DashboardAdvertisement } from '@/features/dashboard/components/dashboard-advertisement'

export const Route = createFileRoute('/_authenticated/dashboard/advertisement')({
  component: DashboardAdvertisement,
})