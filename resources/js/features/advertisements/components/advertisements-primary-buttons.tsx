import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanCreate } from '@/components/permission/permission-gate'
import { useAdvertisements } from './advertisements-provider'

export function AdvertisementsPrimaryButtons() {
  const { setOpen } = useAdvertisements()
  return (
    <div className='flex gap-2'>
      <CanCreate resource="advertisements">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
