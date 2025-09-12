import { Download, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CanCreate } from '@/components/permission/permission-gate'
import { useStores } from './stores-provider'

export function StoresPrimaryButtons() {
  const { setOpen } = useStores()
  return (
    <div className='flex gap-2'>
      <Button
        variant='outline'
        className='space-x-1'
        onClick={() => setOpen('import')}
      >
        <span>Import</span> <Download size={18} />
      </Button>
      <CanCreate resource="stores">
        <Button className='space-x-1' onClick={() => setOpen('create')}>
          <span>Create</span> <Plus size={18} />
        </Button>
      </CanCreate>
    </div>
  )
}
