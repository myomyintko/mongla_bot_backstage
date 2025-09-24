import { createFileRoute } from '@tanstack/react-router'
import { TelegraphBots } from '@/features/telegraph/bot'

export const Route = createFileRoute('/_authenticated/telegraph/bot/')({
  component: TelegraphBots,
})
