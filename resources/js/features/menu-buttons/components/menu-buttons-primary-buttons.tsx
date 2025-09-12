import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanCreate } from '@/components/permission/permission-gate'
import { useMenuButtons } from './menu-buttons-provider'

export function MenuButtonsPrimaryButtons() {
  const { setOpen } = useMenuButtons()
  return (
    <div className='flex gap-2'>
      <CanCreate resource="menu-buttons">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
