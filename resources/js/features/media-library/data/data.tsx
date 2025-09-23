import { FileText, Folder, Grid3X3, Image, List, Paperclip, Video } from 'lucide-react'

export const fileTypes = [
  {
    label: 'All Types',
    value: 'all',
    icon: Folder,
  },
  {
    label: 'Images',
    value: 'image',
    icon: Image,
  },
  {
    label: 'Videos',
    value: 'video',
    icon: Video,
  },
  {
    label: 'Documents',
    value: 'document',
    icon: FileText,
  },
  {
    label: 'Other',
    value: 'other',
    icon: Paperclip,
  },
] as const

export const sortOptions = [
  {
    label: 'Newest first',
    value: 'created_at:desc',
  },
  {
    label: 'Oldest first',
    value: 'created_at:asc',
  },
  {
    label: 'Name A-Z',
    value: 'name:asc',
  },
  {
    label: 'Name Z-A',
    value: 'name:desc',
  },
  {
    label: 'Size (largest)',
    value: 'file_size:desc',
  },
  {
    label: 'Size (smallest)',
    value: 'file_size:asc',
  },
] as const

export const viewModes = [
  {
    label: 'Grid View',
    value: 'grid',
    icon: Grid3X3,
  },
  {
    label: 'List View',
    value: 'list',
    icon: List,
  },
] as const