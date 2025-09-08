import { createFileRoute } from '@tanstack/react-router'
import { PinMessages } from '@/features/pin-messages'
import { z } from 'zod'

const pinMessagesSearchSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  filter: z.string().optional(),
  status: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/pin-messages/')({
  component: PinMessages,
  validateSearch: pinMessagesSearchSchema,
})