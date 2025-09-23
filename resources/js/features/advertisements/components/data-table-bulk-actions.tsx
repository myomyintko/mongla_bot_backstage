import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp } from 'lucide-react'
import { toast } from 'sonner'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { CanEdit, CanDelete } from '@/components/permission/permission-gate'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { statuses } from '../data/data'
import { type Advertisement } from '../data/schema'
import { advertisementsService } from '@/services/advertisements-service'
import { AdvertisementsMultiDeleteDialog } from './advertisements-multi-delete-dialog'

// Advertisements bulk actions component
type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows
  const queryClient = useQueryClient()

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[], status: string }) => {
      const statusValue = statuses.find(s => s.value === status)?.value || status
      return advertisementsService.bulkUpdate({
        ids,
        updates: { status: parseInt(statusValue) }
      })
    },
    onSuccess: (_, { status }) => {
      toast.success(`Status updated to "${status}" for ${selectedRows.length} advertisement${selectedRows.length > 1 ? 's' : ''}.`)
      queryClient.invalidateQueries({ queryKey: ['advertisements'] })
      table.resetRowSelection()
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Failed to update status'
      toast.error(message)
    },
  })

  const handleBulkStatusChange = (status: string) => {
    const selectedAdvertisements = selectedRows.map((row) => row.original as Advertisement)
    const ids = selectedAdvertisements.map(item => item.id)
    bulkUpdateMutation.mutate({ ids, status })
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='advertisements'>
        <CanEdit resource="advertisements">
          <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  title='Update status'
                  disabled={bulkUpdateMutation.isPending}
                >
                  <CircleArrowUp />
                  <span className='sr-only'>Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
                disabled={bulkUpdateMutation.isPending}
              >
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
          </DropdownMenu>
        </CanEdit>

        <CanDelete resource="advertisements">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant='destructive'
                size='icon'
                onClick={() => setShowDeleteConfirm(true)}
                className='size-8'
                aria-label='Delete selected tasks'
                title='Delete selected tasks'
              >
                <Trash2 />
                <span className='sr-only'>Delete selected tasks</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete selected tasks</p>
            </TooltipContent>
          </Tooltip>
        </CanDelete>
      </BulkActionsToolbar>

      <AdvertisementsMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
