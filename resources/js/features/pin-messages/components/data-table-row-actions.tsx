import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CanEdit, CanDelete } from '@/components/permission/permission-gate'
import { usePinMessages } from './pin-messages-provider'
import { type PinMessage } from '../data/schema'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function DataTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  
  const { setOpen, setCurrentRow } = usePinMessages()

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <CanEdit resource="pin-messages">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original as PinMessage)
              setOpen('update')
            }}
          >
            Edit
          </DropdownMenuItem>
        </CanEdit>
        
        <CanDelete resource="pin-messages">
          <DropdownMenuItem
            onClick={() => {
              setCurrentRow(row.original as PinMessage)
              setOpen('delete')
            }}
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </CanDelete>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
