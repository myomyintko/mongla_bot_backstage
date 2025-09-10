import { z } from 'zod'

export const mediaLibrarySchema = z.object({
  id: z.number(),
  original_name: z.string(),
  file_path: z.string(),
  file_size: z.number(),
  mime_type: z.string(),
  file_type: z.enum(['image', 'video', 'document', 'other']),
  width: z.number().nullable(),
  height: z.number().nullable(),
  duration: z.number().nullable(), // for videos, in seconds
  created_at: z.string(),
  updated_at: z.string(),
  // Accessor properties
  url: z.string().optional(),
  extension: z.string().optional(),
  formatted_size: z.string().optional(),
  formatted_duration: z.string().optional(),
})

export type MediaLibrary = z.infer<typeof mediaLibrarySchema>