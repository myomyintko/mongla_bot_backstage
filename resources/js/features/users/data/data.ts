import { Shield, UserCheck, Users, Edit, Eye } from 'lucide-react'

export const callTypes = new Map<number, string>([
  [1, 'bg-teal-100/30 text-teal-900 dark:text-teal-200 border-teal-200'],
  [2, 'bg-neutral-300/40 border-neutral-300'],
  [
    4,
    'bg-destructive/10 dark:bg-destructive/50 text-destructive dark:text-primary border-destructive/10',
  ],
])

export const roles = [
  {
    label: 'Super Admin',
    value: 'superadmin',
    icon: Shield,
  },
  {
    label: 'Admin',
    value: 'admin',
    icon: UserCheck,
  },
  {
    label: 'Manager',
    value: 'manager',
    icon: Users,
  },
  {
    label: 'Editor',
    value: 'editor',
    icon: Edit,
  },
  {
    label: 'Viewer',
    value: 'viewer',
    icon: Eye,
  },
] as const
