import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SetupPassword } from '@/features/auth/setup-password'

const searchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/(auth)/setup-password')({
  component: SetupPassword,
  validateSearch: searchSchema,
})