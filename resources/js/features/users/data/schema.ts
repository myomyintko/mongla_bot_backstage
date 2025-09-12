import { z } from 'zod'

const userStatusSchema = z.union([
  z.literal(1), // active
  z.literal(2), // inactive
  z.literal(4), // suspended
])
export type UserStatus = z.infer<typeof userStatusSchema>

// Status mapping for display
export const STATUS_LABELS = {
  1: 'Active',
  2: 'Inactive', 
  4: 'Suspended',
} as const

const userRoleSchema = z.union([
  z.literal('superadmin'),
  z.literal('admin'),
  z.literal('manager'),
  z.literal('editor'),
  z.literal('viewer'),
])

const userSchema = z.object({
  id: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  username: z.string(),
  email: z.string(),
  status: userStatusSchema,
  role: userRoleSchema,
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type User = z.infer<typeof userSchema>

export const userListSchema = z.array(userSchema)
