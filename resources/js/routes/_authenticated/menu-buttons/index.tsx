import z from 'zod'
import { createFileRoute } from '@tanstack/react-router'
import { MenuButtons } from '@/features/menu-buttons'
import { statuses, hierarchyTypes, buttonTypes } from '@/features/menu-buttons/data/data'

const menuButtonsSearchSchema = z.object({
  page: z.number().optional().catch(1),
  per_page: z.number().optional().catch(10),
  status: z
    .array(z.enum(statuses.map((status) => status.value)))
    .optional()
    .catch([]),
  button_type: z
    .array(z.enum(buttonTypes.map((type) => type.value)))
    .optional()
    .catch([]),
  hierarchy: z
    .array(z.enum(hierarchyTypes.map((type) => type.value)))
    .optional()
    .catch([]),
  filter: z.string().optional().catch(''),
})

export const Route = createFileRoute('/_authenticated/menu-buttons/')({
  validateSearch: menuButtonsSearchSchema,
  component: MenuButtons,
})
