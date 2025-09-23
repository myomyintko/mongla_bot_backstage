import { createFileRoute } from '@tanstack/react-router'
import { TelegraphBots } from '@/features/telegraph/bots'

export const Route = createFileRoute('/_authenticated/telegraph/bots/')({
  component: TelegraphBots,
})
