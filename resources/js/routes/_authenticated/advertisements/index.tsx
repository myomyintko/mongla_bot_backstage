import { createFileRoute } from '@tanstack/react-router'
import { Advertisements } from '@/features/advertisements'
import { z } from 'zod'

const advertisementsSearchSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  filter: z.string().optional(),
  status: z.array(z.string()).optional(),
  store_id: z.array(z.string()).optional(),
})

export const Route = createFileRoute('/_authenticated/advertisements/')({
  component: Advertisements,
  validateSearch: advertisementsSearchSchema,
})