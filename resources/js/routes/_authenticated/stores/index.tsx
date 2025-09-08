import { createFileRoute } from '@tanstack/react-router'
import StoresPage from '@/features/stores'

export const Route = createFileRoute('/_authenticated/stores/')({
  component: StoresPage,
})