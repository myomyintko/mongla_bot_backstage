import { z } from 'zod'

export const storesSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  media_url: z.string().nullable(),
  menu_urls: z.array(z.string()).nullable(),
  open_hour: z.string().nullable(),
  close_hour: z.string().nullable(),
  status: z.number().nullable(),
  address: z.string().nullable(),
  recommand: z.boolean(),
  sub_btns: z.array(z.object({
    id: z.string(),
    platform: z.string(),
    label: z.string(),
    url: z.string(),
  })).nullable(),
  menu_button_id: z.number().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  menu_button: z.object({
    id: z.number(),
    name: z.string().nullable(),
  }).nullable().optional(),
})

export type Store = z.infer<typeof storesSchema>
