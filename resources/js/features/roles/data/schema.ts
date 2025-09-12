import { z } from 'zod'

const roleSchema = z.object({
  id: z.string(),
  name: z.string(),
  display_name: z.string(),
  description: z.string(),
  permissions_count: z.number(),
  permissions: z.array(z.string()),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
})

export type Role = z.infer<typeof roleSchema>

export const roleListSchema = z.array(roleSchema)

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255, 'Name must be less than 255 characters'),
  display_name: z.string().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  permissions: z.array(z.string()).optional().default([]),
})

export const updateRoleSchema = createRoleSchema

export type CreateRoleFormData = z.infer<typeof createRoleSchema>
export type UpdateRoleFormData = z.infer<typeof updateRoleSchema>