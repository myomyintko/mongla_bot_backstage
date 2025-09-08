import { createFileRoute } from '@tanstack/react-router'
import { Stores } from '@/features/stores'
import { z } from 'zod'

const storesSearchSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  filter: z.string().optional(),
  status: z.array(z.string()).optional(),
  recommand: z.array(z.string()).optional(),
  menu_button_id: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/stores/')({
  component: Stores,
  validateSearch: storesSearchSchema,
})