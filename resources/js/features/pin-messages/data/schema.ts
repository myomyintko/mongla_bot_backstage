import { z } from 'zod'

export const pinMessagesSchema = z.object({
  id: z.number(),
  media_url: z.string().nullable(),
  status: z.number().nullable(),
  sort: z.number().nullable(),
  content: z.string().nullable(),
  btn_name: z.string().nullable(),
  btn_link: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export type PinMessage = z.infer<typeof pinMessagesSchema>
