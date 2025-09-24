import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { BotTemplates } from '@/features/bot-templates'
import { TEMPLATE_TYPES } from '@/features/bot-templates/data/schema'

const botTemplatesSearchSchema = z.object({
  page: z.number().optional().catch(1),
  per_page: z.number().optional().catch(10),
  type: z
    .array(z.enum(Object.keys(TEMPLATE_TYPES) as [string, ...string[]]))
    .optional()
    .catch([]),
  is_active: z
    .array(z.enum(['true', 'false']))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/bot-templates/')({
  validateSearch: botTemplatesSearchSchema,
  component: BotTemplates,
})