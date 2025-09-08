import { z } from 'zod'

export const menuButtonsSchema = z.object({
  id: z.number(),
  parent_id: z.number().nullable(),
  name: z.string(),
  button_type: z.string(),
  sort: z.number().nullable(),
  status: z.number(),
  media_url: z.string().nullable(),
  enable_template: z.boolean(),
  template_content: z.string().nullable(),
  sub_btns: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  parent: z.object({
    id: z.number(),
    name: z.string(),
  }).nullable().optional(),
  children: z.array(z.any()).optional(),
})

export type MenuButton = z.infer<typeof menuButtonsSchema>
