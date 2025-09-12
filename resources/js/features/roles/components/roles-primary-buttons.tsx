import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanCreate } from '@/components/permission/permission-gate'
import { useRoles } from './roles-provider'

export function RolesPrimaryButtons() {
  const { setOpen } = useRoles()

  return (
    <div className='flex gap-2'>
      <CanCreate resource="roles">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create Role</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
