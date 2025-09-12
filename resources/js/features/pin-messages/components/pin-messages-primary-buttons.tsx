import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanCreate } from '@/components/permission/permission-gate'
import { usePinMessages } from './pin-messages-provider'

export function PinMessagesPrimaryButtons() {
  const { setOpen } = usePinMessages()
  return (
    <div className='flex gap-2'>
      <CanCreate resource="pin-messages">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
