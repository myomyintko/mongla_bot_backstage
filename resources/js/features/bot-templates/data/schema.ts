import { z } from 'zod'

export const botTemplateSchema = z.object({
  id: z.number(),
  type: z.string(),
  content: z.string(),
  is_active: z.boolean(),
  variables: z.array(z.string()).nullable(),
  created_at: z.string(),
  updated_at: z.string(),
})

export const botTemplateCreateSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  content: z.string().min(1, 'Content is required'),
  is_active: z.boolean().optional(),
  variables: z.array(z.string()).optional(),
})

export const botTemplateUpdateSchema = botTemplateCreateSchema.partial()

export const botTemplatePreviewSchema = z.object({
  type: z.string().min(1, 'Type is required'),
  content: z.string().min(1, 'Content is required'),
  variables: z.record(z.string(), z.string()).optional(),
})

export type BotTemplate = z.infer<typeof botTemplateSchema>
export type BotTemplateCreate = z.infer<typeof botTemplateCreateSchema>
export type BotTemplateUpdate = z.infer<typeof botTemplateUpdateSchema>
export type BotTemplatePreview = z.infer<typeof botTemplatePreviewSchema>

export const TEMPLATE_TYPES = {
  welcome: 'Welcome Message',
  help: 'Help Message',
  trending_stores: 'Trending Stores',
  store_list: 'Store List',
  store_detail: 'Store Detail',
  search_results: 'Search Results',
  no_results: 'No Results',
  error: 'Error Message',
  advertisement: 'Advertisement',
  menu_selection: 'Menu Selection',
  pagination: 'Pagination',
} as const

export type TemplateType = keyof typeof TEMPLATE_TYPES
