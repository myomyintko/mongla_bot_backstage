import { z } from 'zod'

export const advertisementsSchema = z.object({
  id: z.number(),
  store_id: z.number().nullable(),
  title: z.string(),
  status: z.number().nullable(),
  description: z.string().nullable(),
  media_url: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  frequency_cap_minutes: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  store: z.object({
    id: z.number(),
    name: z.string().nullable(),
  }).nullable().optional(),
})

export type Advertisement = z.infer<typeof advertisementsSchema>
